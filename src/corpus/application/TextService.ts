import Bluebird from 'bluebird'
import { produce, castDraft } from 'immer'
import _ from 'lodash'
import { stringify } from 'query-string'

import BibliographyService from 'bibliography/application/BibliographyService'
import { ChapterAlignment } from 'corpus/domain/alignment'
import {
  Chapter,
  ChapterDisplay,
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ExtantLines } from 'corpus/domain/extant-lines'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import { Line, LineVariant, ManuscriptLine } from 'corpus/domain/line'
import { LineDetails } from 'corpus/domain/line-details'
import { Manuscript } from 'corpus/domain/manuscript'

import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Text } from 'corpus/domain/text'
import { TextId } from 'transliteration/domain/text-id'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { AbstractLemmatizationFactory } from 'fragmentarium/application/LemmatizationFactory'
import ApiClient from 'http/ApiClient'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Token } from 'transliteration/domain/token'
import {
  ChapterDisplayDto,
  fromChapterDto,
  fromDictionaryLineDto,
  fromDto,
  fromLineDetailsDto,
  fromManuscriptDto,
  fromSiglumAndTransliterationDto,
  LineVariantDisplayDto,
  toAlignmentDto,
  toLemmatizationDto,
  toLinesDto,
  toManuscriptsDto,
} from './dtos'
import { isNoteLine } from 'transliteration/domain/type-guards'
import TranslationLine from 'transliteration/domain/translation-line'
import { NoteLine, NoteLineDto } from 'transliteration/domain/note-line'
import { fromTransliterationLineDto } from 'transliteration/application/dtos'
import { ParallelLine } from 'transliteration/domain/parallel-line'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryResult } from 'query/QueryResult'
import { ChapterSlugs, TextSlugs } from 'router/sitemap'

const chapterDisplayCacheEntryLifetimeInMilliseconds = 2 * 60 * 1000
const maximumCachedChapterDisplays = 250
const chapterDisplayConcurrencyLimit = 4
const defaultCacheScope = 'default'

type CacheEntry<CacheValue> = {
  readonly expiresAt: number
  readonly value: CacheValue
}

type QueueState = {
  activeCount: number
  waitingResolvers: Array<() => void>
}

class CorpusLemmatizationFactory extends AbstractLemmatizationFactory<
  Chapter,
  ChapterLemmatization
> {
  createLemmatization(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return Bluebird.mapSeries(chapter.lines, (line) =>
      Bluebird.mapSeries(line.variants, (variant) =>
        this.lemmatizeVariant(variant),
      ),
    )
  }

  private lemmatizeVariant(variant: LineVariant): Bluebird<LineLemmatization> {
    return this.createLemmatizationLine(variant.reconstructionTokens)
      .then((reconstruction) =>
        reconstruction.map((token) => token.applySuggestion()),
      )
      .then((reconstruction) =>
        Bluebird.mapSeries(variant.manuscripts, (manuscript) =>
          this.lemmatizeManuscript(manuscript),
        ).then((lemmatizedManuscripts) => [
          reconstruction,
          lemmatizedManuscripts,
        ]),
      )
  }

  private lemmatizeManuscript(
    manuscript: ManuscriptLine,
  ): Bluebird<LemmatizationToken[]> {
    return Bluebird.mapSeries(manuscript.atfTokens, (token) =>
      token.lemmatizable
        ? this.createLemmas(token).then(
            (lemmas) => new LemmatizationToken(token.value, true, lemmas, []),
          )
        : new LemmatizationToken(token.value, false),
    )
  }

  private applySuggestion(
    lemmatizationToken: LemmatizationToken,
    atfToken: Token,
    reconstruction: LemmatizationToken[],
  ): LemmatizationToken {
    const suggestion = this.getSuggestion(atfToken, reconstruction)
    return lemmatizationToken.hasLemma || _.isEmpty(suggestion)
      ? lemmatizationToken.applySuggestion()
      : lemmatizationToken.setUniqueLemma(suggestion as UniqueLemma, true)
  }

  private getSuggestion(
    atfToken: Token,
    reconstruction: LemmatizationToken[],
  ): UniqueLemma | null {
    return _.isNil(atfToken.alignment)
      ? null
      : reconstruction[atfToken.alignment].uniqueLemma
  }
}

function createTextUrl(
  genre: string,
  category: string | number,
  index: string | number,
): string {
  return `/texts/${encodeURIComponent(genre)}/${encodeURIComponent(
    category,
  )}/${encodeURIComponent(index)}`
}

export function createChapterUrl({
  textId: { genre, category, index },
  stage,
  name,
}: ChapterId): string {
  return `${createTextUrl(
    genre,
    category,
    index,
  )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(name)}`
}

export default class TextService {
  private readonly referenceInjector: ReferenceInjector

  private cacheScope: string | null = null

  private cachedTexts: Bluebird<Text[]> | null = null

  private readonly cachedChapterDisplays = new Map<
    string,
    CacheEntry<ChapterDisplay>
  >()

  private readonly cachedChapterDisplayRequests = new Map<
    string,
    Bluebird<ChapterDisplay>
  >()

  private readonly chapterDisplayQueueState: QueueState = {
    activeCount: 0,
    waitingResolvers: [],
  }

  constructor(
    private readonly apiClient: ApiClient,
    private readonly fragmentService: FragmentService,
    private readonly wordService: WordService,
    bibliographyService: BibliographyService,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  find({ genre, category, index }: TextId): Bluebird<Text> {
    return this.apiClient
      .fetchJson<Record<string, unknown>>(
        createTextUrl(genre, category, index),
        false,
      )
      .then(fromDto)
      .then((text) =>
        Bluebird.all(
          text.chapters.map((chapter) =>
            this.referenceInjector
              .injectReferencesToMarkup(chapter.title)
              .then((title) => ({
                ...chapter,
                title,
              })),
          ),
        ).then((chapters) =>
          produce(text, (draft) => {
            draft.chapters = castDraft(chapters)
          }),
        ),
      )
  }

  findChapter(id: ChapterId): Bluebird<Chapter> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.fetchJson<Record<string, unknown>>(
        createChapterUrl(id),
        false,
      ),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  findChapterDisplay(
    id: ChapterId,
    lines: readonly number[] = [],
    variants: readonly number[] = [],
  ): Bluebird<ChapterDisplay> {
    const cacheKey = this.createChapterDisplayCacheKey(id, lines, variants)
    return this.getOrFetchCachedValue(
      this.cachedChapterDisplays,
      this.cachedChapterDisplayRequests,
      cacheKey,
      maximumCachedChapterDisplays,
      () =>
        this.runWithConcurrencyLimit(
          this.chapterDisplayQueueState,
          chapterDisplayConcurrencyLimit,
          () => this.fetchChapterDisplay(id, lines, variants),
        ),
    )
  }

  private fetchChapterDisplay(
    id: ChapterId,
    lines: readonly number[] = [],
    variants: readonly number[] = [],
  ): Bluebird<ChapterDisplay> {
    const lineParams = _.isEmpty(lines)
      ? ''
      : `?${stringify({ lines, variants })}`
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.fetchJson<ChapterDisplayDto>(
        `${createChapterUrl(id)}/display${lineParams}`,
        false,
      ),
    ]).then(([, chapter]) =>
      Bluebird.all(
        chapter.lines.map((line) =>
          Bluebird.all([
            Bluebird.all(
              line.translation.map((translation) =>
                this.referenceInjector
                  .injectReferencesToMarkup(translation.parts)
                  .then(
                    (parts) =>
                      new TranslationLine({
                        ...castDraft(translation),
                        parts,
                      }),
                  ),
              ),
            ),
            Bluebird.all(
              line.variants.map((variant, index) =>
                this.findLineVariant(variant, index === 0),
              ),
            ),
            Bluebird.all(
              line.oldLineNumbers.map((oldLineNumberDto) =>
                this.referenceInjector.injectReferenceToOldLineNumber(
                  oldLineNumberDto,
                ),
              ),
            ),
          ]).then(([translation, lineVariants, oldLineNumbers]) => ({
            ...line,
            translation,
            variants: lineVariants,
            oldLineNumbers,
          })),
        ),
      ).then(
        (chapterLines) =>
          new ChapterDisplay(
            chapter.id,
            chapter.textHasDoi,
            chapter.textName,
            chapter.isSingleStage,
            chapter.title,
            chapterLines,
            chapter.record,
            chapter.atf,
          ),
      ),
    )
  }

  findLineVariant(
    variant: LineVariantDisplayDto,
    isPrimaryVariant: boolean,
  ): Bluebird<LineVariantDisplay> {
    return Bluebird.all([
      variant.note &&
        this.referenceInjector
          .injectReferencesToMarkup(variant.note.parts)
          .then(
            (parts) =>
              new NoteLine({
                ...(variant.note as NoteLineDto),
                parts,
              }),
          ),
      variant.parallelLines.map(
        (parallel) => fromTransliterationLineDto(parallel) as ParallelLine,
      ),
      this.referenceInjector.injectReferencesToMarkup(variant.intertext),
    ]).then(([note, parallelLines, intertext]) => ({
      ...variant,
      reconstruction: variant.reconstruction.map((token, index) => ({
        ...token,
        sentenceIndex: index,
      })),
      note,
      parallelLines,
      intertext,
      isPrimaryVariant,
    }))
  }

  findChapterLine(
    id: ChapterId,
    number: number,
    variantNumber: number,
  ): Bluebird<LineDetails> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.fetchJson(
        `${createChapterUrl(id)}/lines/${number}`,
        false,
      ),
    ])
      .then(([, json]) => fromLineDetailsDto(json, variantNumber))
      .then((line) =>
        Bluebird.all(
          line.variants.map((variant) =>
            Bluebird.all(
              variant.manuscripts.map((manuscript) =>
                Bluebird.all(
                  manuscript.paratext.map((line) => {
                    if (isNoteLine(line)) {
                      return this.referenceInjector
                        .injectReferencesToMarkup(line.parts)
                        .then((parts) =>
                          produce(line, (draft) => {
                            draft.parts = castDraft(parts)
                          }),
                        )
                    } else {
                      return line
                    }
                  }),
                ).then((paratext) =>
                  produce(manuscript, (draft) => {
                    draft.paratext = castDraft(paratext)
                  }),
                ),
              ),
            ).then((manuscripts) => ({ ...variant, manuscripts })),
          ),
        ).then((variants) => new LineDetails(variants, variantNumber)),
      )
  }

  findColophons(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/colophons`, false)
      .then(fromSiglumAndTransliterationDto)
      .then((colophons) =>
        Bluebird.all(
          colophons.map(({ siglum, text }) =>
            this.referenceInjector
              .injectReferencesToText(text)
              .then((text) => ({
                siglum,
                text,
              })),
          ),
        ),
      )
  }

  findUnplacedLines(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/unplaced_lines`, false)
      .then(fromSiglumAndTransliterationDto)
      .then((unplacedLines) =>
        Bluebird.all(
          unplacedLines.map(({ siglum, text }) =>
            this.referenceInjector
              .injectReferencesToText(text)
              .then((text) => ({
                siglum,
                text,
              })),
          ),
        ),
      )
  }

  findExtantLines(id: ChapterId): Bluebird<ExtantLines> {
    return this.apiClient.fetchJson<ExtantLines>(
      `${createChapterUrl(id)}/extant_lines`,
      false,
    )
  }

  findManuscripts(id: ChapterId): Bluebird<Manuscript[]> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.fetchJson<unknown[]>(
        `${createChapterUrl(id)}/manuscripts`,
        false,
      ),
    ]).then(([, manuscripts]) => manuscripts.map(fromManuscriptDto))
  }

  private loadProvenances(): Bluebird<void> {
    return Bluebird.resolve(this.fragmentService.fetchProvenances())
      .then(() => undefined)
      .catch((error) => {
        console.error('Failed to preload provenances', error)
      })
  }

  list(): Bluebird<Text[]> {
    this.clearCachesWhenScopeChanges()

    if (!this.cachedTexts) {
      this.cachedTexts = this.apiClient
        .fetchJson<unknown[]>('/texts', false)
        .then((dtos) => dtos.map(fromDto))
        .catch((error) => {
          this.cachedTexts = null
          throw error
        })
    }
    return this.cachedTexts
  }

  searchLemma(
    lemmaId: string,
    genre: string | null | undefined = null,
  ): Bluebird<DictionaryLineDisplay[]> {
    return this.apiClient
      .fetchJson<unknown[]>(
        `/lemmasearch?${stringify({
          lemma: lemmaId,
          genre: genre,
        })}`,
        false,
      )
      .then((dtos) => dtos.map(fromDictionaryLineDto))
  }

  query(query: CorpusQuery): Bluebird<CorpusQueryResult> {
    this.clearCachesWhenScopeChanges()
    return this.apiClient.fetchJson<CorpusQueryResult>(
      `/corpus/query?${stringify(query)}`,
      false,
    )
  }

  updateAlignment(
    id: ChapterId,
    alignment: ChapterAlignment,
  ): Bluebird<Chapter> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.postJson(
        `${createChapterUrl(id)}/alignment`,
        toAlignmentDto(alignment),
      ),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  updateLemmatization(
    id: ChapterId,
    lemmatization: ChapterLemmatization,
  ): Bluebird<Chapter> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.postJson(
        `${createChapterUrl(id)}/lemmatization`,
        toLemmatizationDto(lemmatization),
      ),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  updateManuscripts(
    id: ChapterId,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[],
  ): Bluebird<Chapter> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.postJson(
        `${createChapterUrl(id)}/manuscripts`,
        toManuscriptsDto(manuscripts, uncertainChapters),
      ),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  updateLines(id: ChapterId, lines: readonly Line[]): Bluebird<Chapter> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.postJson(
        `${createChapterUrl(id)}/lines`,
        toLinesDto(lines),
      ),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  importChapter(id: ChapterId, atf: string): Bluebird<Chapter> {
    return Bluebird.all([
      this.loadProvenances(),
      this.apiClient.postJson(`${createChapterUrl(id)}/import`, { atf }),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  findSuggestions(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService,
    ).createLemmatization(chapter)
  }

  listAllTexts(): Bluebird<TextSlugs> {
    return this.apiClient.fetchJson<TextSlugs>('/corpus/texts/all', false)
  }

  listAllChapters(): Bluebird<ChapterSlugs> {
    return this.apiClient.fetchJson<ChapterSlugs>('/corpus/chapters/all', false)
  }

  private getOrFetchCachedValue<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    requests: Map<CacheKey, Bluebird<CacheValue>>,
    key: CacheKey,
    maximumCacheSize: number,
    fetchValue: () => Bluebird<CacheValue>,
  ): Bluebird<CacheValue> {
    this.clearCachesWhenScopeChanges()

    const cachedValue = this.getCachedValue(cache, key)
    if (cachedValue !== null) {
      return Bluebird.resolve(cachedValue)
    }

    const cachedRequest = requests.get(key)
    if (cachedRequest) {
      return cachedRequest.then((value) => value)
    }

    const requestReference: { current?: Bluebird<CacheValue> } = {}
    const request = fetchValue()
      .then((value) =>
        requests.get(key) === requestReference.current
          ? this.setCachedValue(cache, key, value, maximumCacheSize)
          : value,
      )
      .finally(() => {
        if (requests.get(key) === requestReference.current) {
          requests.delete(key)
        }
      })

    requestReference.current = request
    requests.set(key, request)

    return request.then((value) => value)
  }

  private getCachedValue<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    key: CacheKey,
  ): CacheValue | null {
    const entry = cache.get(key)
    if (!entry) {
      return null
    }

    if (entry.expiresAt <= Date.now()) {
      cache.delete(key)
      return null
    }

    cache.delete(key)
    cache.set(key, entry)
    return entry.value
  }

  private setCachedValue<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    key: CacheKey,
    value: CacheValue,
    maximumCacheSize: number,
  ): CacheValue {
    cache.delete(key)
    cache.set(key, {
      expiresAt: Date.now() + chapterDisplayCacheEntryLifetimeInMilliseconds,
      value,
    })
    this.trimCache(cache, maximumCacheSize)
    return value
  }

  private trimCache<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    maximumCacheSize: number,
  ): void {
    while (cache.size > maximumCacheSize) {
      const oldestKey = cache.keys().next().value
      if (oldestKey === undefined) {
        return
      }

      cache.delete(oldestKey)
    }
  }

  private clearAllCaches(): void {
    this.cachedTexts = null
    this.cachedChapterDisplays.clear()
    this.cachedChapterDisplayRequests.clear()
  }

  private clearCachesWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()

    if (this.cacheScope === null) {
      this.cacheScope = nextScope
      return
    }

    if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.clearAllCaches()
    }
  }

  private resolveCacheScope(): string {
    try {
      return this.getCacheScope()
    } catch {
      return defaultCacheScope
    }
  }

  private createChapterDisplayCacheKey(
    id: ChapterId,
    lines: readonly number[] = [],
    variants: readonly number[] = [],
  ): string {
    return `${createChapterUrl(id)}?${stringify({ lines, variants })}`
  }

  private runWithConcurrencyLimit<ReturnValue>(
    queueState: QueueState,
    maximumConcurrency: number,
    operation: () => Bluebird<ReturnValue>,
  ): Bluebird<ReturnValue> {
    return this.acquireConcurrencySlot(queueState, maximumConcurrency).then(
      (releaseSlot) =>
        operation().finally(() => {
          releaseSlot()
        }),
    )
  }

  private acquireConcurrencySlot(
    queueState: QueueState,
    maximumConcurrency: number,
  ): Bluebird<() => void> {
    return new Bluebird((resolve) => {
      const tryAcquireSlot = () => {
        if (queueState.activeCount < maximumConcurrency) {
          queueState.activeCount += 1
          resolve(() => this.releaseConcurrencySlot(queueState))
          return
        }

        queueState.waitingResolvers.push(tryAcquireSlot)
      }

      tryAcquireSlot()
    })
  }

  private releaseConcurrencySlot(queueState: QueueState): void {
    queueState.activeCount = Math.max(0, queueState.activeCount - 1)
    const next = queueState.waitingResolvers.shift()
    if (next) {
      next()
    }
  }
}

import Bluebird from 'bluebird'
import produce, { castDraft } from 'immer'
import _ from 'lodash'
import { stringify } from 'query-string'

import BibliographyService from 'bibliography/application/BibliographyService'
import { ChapterAlignment } from 'corpus/domain/alignment'
import { Chapter, ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ExtantLines } from 'corpus/domain/extant-lines'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import { Line, LineVariant, ManuscriptLine } from 'corpus/domain/line'
import { LineDetails, LineVariantDisplay } from 'corpus/domain/line-details'
import { Manuscript } from 'corpus/domain/manuscript'
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Text } from 'corpus/domain/text'
import { TextId } from 'transliteration/domain/text-id'
import TransliterationSearchResult from 'corpus/domain/TransliterationSearchResult'
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
  fromDto,
  fromLineDetailsDto,
  fromLineDto,
  fromManuscriptDto,
  fromSiglumAndTransliterationDto,
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

class CorpusLemmatizationFactory extends AbstractLemmatizationFactory<
  Chapter,
  ChapterLemmatization
> {
  createLemmatization(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return Bluebird.mapSeries(chapter.lines, (line) =>
      Bluebird.mapSeries(line.variants, (variant) =>
        this.lemmatizeVariant(variant)
      )
    )
  }

  private lemmatizeVariant(variant: LineVariant): Bluebird<LineLemmatization> {
    return this.createLemmatizationLine(variant.reconstructionTokens)
      .then((reconstruction) =>
        reconstruction.map((token) => token.applySuggestion())
      )
      .then((reconstruction) =>
        Bluebird.mapSeries(variant.manuscripts, (manuscript) =>
          this.lemmatizeManuscript(manuscript)
        ).then((lemmatizedManuscripts) => [
          reconstruction,
          lemmatizedManuscripts,
        ])
      )
  }

  private lemmatizeManuscript(
    manuscript: ManuscriptLine
  ): Bluebird<LemmatizationToken[]> {
    return Bluebird.mapSeries(manuscript.atfTokens, (token) =>
      token.lemmatizable
        ? this.createLemmas(token).then(
            (lemmas) => new LemmatizationToken(token.value, true, lemmas, [])
          )
        : new LemmatizationToken(token.value, false)
    )
  }

  private applySuggestion(
    lemmatizationToken: LemmatizationToken,
    atfToken: Token,
    reconstruction: LemmatizationToken[]
  ): LemmatizationToken {
    const suggestion = this.getSuggestion(atfToken, reconstruction)
    return lemmatizationToken.hasLemma || _.isEmpty(suggestion)
      ? lemmatizationToken.applySuggestion()
      : lemmatizationToken.setUniqueLemma(suggestion as UniqueLemma, true)
  }

  private getSuggestion(
    atfToken: Token,
    reconstruction: LemmatizationToken[]
  ): UniqueLemma | null {
    return _.isNil(atfToken.alignment)
      ? null
      : reconstruction[atfToken.alignment].uniqueLemma
  }
}

function createTextUrl(
  genre: string,
  category: string | number,
  index: string | number
): string {
  return `/texts/${encodeURIComponent(genre)}/${encodeURIComponent(
    category
  )}/${encodeURIComponent(index)}`
}

function createChapterUrl({
  textId: { genre, category, index },
  stage,
  name,
}: ChapterId): string {
  return `${createTextUrl(
    genre,
    category,
    index
  )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(name)}`
}

export default class TextService {
  private readonly referenceInjector: ReferenceInjector

  constructor(
    private readonly apiClient: ApiClient,
    private readonly fragmentService: FragmentService,
    private readonly wordService: WordService,
    bibliographyService: BibliographyService
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  find({ genre, category, index }: TextId): Bluebird<Text> {
    return this.apiClient
      .fetchJson(createTextUrl(genre, category, index), true)
      .then(fromDto)
      .then((text) =>
        Bluebird.all(
          text.chapters.map((chapter) =>
            this.referenceInjector
              .injectReferencesToMarkup(chapter.title)
              .then((title) => ({
                ...chapter,
                title,
              }))
          )
        ).then((chapters) =>
          produce(text, (draft) => {
            draft.chapters = castDraft(chapters)
          })
        )
      )
  }

  findChapter(id: ChapterId): Bluebird<Chapter> {
    return this.apiClient
      .fetchJson(createChapterUrl(id), true)
      .then(fromChapterDto)
  }

  findChapterDisplay(id: ChapterId): Bluebird<ChapterDisplay> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/display`, true)
      .then((chapter: ChapterDisplayDto) =>
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
                        })
                    )
                )
              ),
              line.variants.map((variant) =>
                this.referenceInjector.injectReferencesToMarkup(
                  variant.intertext
                )
              ),
              line.variants.map(
                (variant) =>
                  variant.note &&
                  this.referenceInjector
                    .injectReferencesToMarkup(variant.note.parts)
                    .then(
                      (parts) =>
                        new NoteLine({
                          ...(variant.note as NoteLineDto),
                          parts,
                        })
                    )
              ),
              line.variants.map((variant) =>
                variant.parallelLines.map(
                  (parallel) =>
                    fromTransliterationLineDto(parallel) as ParallelLine
                )
              ),
            ]).then(([translation]) => ({
              ...line,
              translation,
            }))
          )
        ).then(
          (lines) =>
            new ChapterDisplay(
              chapter.id,
              chapter.textHasDoi,
              chapter.textName,
              chapter.isSingleStage,
              chapter.title,
              lines,
              chapter.record
            )
        )
      )
  }

  findChapterLine(
    id: ChapterId,
    number: number,
    variantNumber: number
  ): Bluebird<LineDetails> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/lines/${number}`, true)
      .then((json) => fromLineDetailsDto(json, variantNumber))
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
                          })
                        )
                    } else {
                      return line
                    }
                  })
                ).then((paratext) =>
                  produce(manuscript, (draft) => {
                    draft.paratext = castDraft(paratext)
                  })
                )
              )
            ).then((manuscripts) => new LineVariantDisplay(manuscripts))
          )
        ).then((variants) => new LineDetails(variants, variantNumber))
      )
  }

  findColophons(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/colophons`, true)
      .then(fromSiglumAndTransliterationDto)
      .then((colophons) =>
        Bluebird.all(
          colophons.map(({ siglum, text }) =>
            this.referenceInjector
              .injectReferencesToText(text)
              .then((text) => ({
                siglum,
                text,
              }))
          )
        )
      )
  }

  findUnplacedLines(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/unplaced_lines`, true)
      .then(fromSiglumAndTransliterationDto)
      .then((unplacedLines) =>
        Bluebird.all(
          unplacedLines.map(({ siglum, text }) =>
            this.referenceInjector
              .injectReferencesToText(text)
              .then((text) => ({
                siglum,
                text,
              }))
          )
        )
      )
  }

  findExtantLines(id: ChapterId): Bluebird<ExtantLines> {
    return this.apiClient.fetchJson(
      `${createChapterUrl(id)}/extant_lines`,
      true
    )
  }

  findManuscripts(id: ChapterId): Bluebird<Manuscript[]> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/manuscripts`, true)
      .then((manuscripts) => manuscripts.map(fromManuscriptDto))
  }

  list(): Bluebird<Text[]> {
    return this.apiClient
      .fetchJson('/texts', false)
      .then((dtos) => dtos.map(fromDto))
  }

  searchTransliteration(
    transliteration: string
  ): Bluebird<TransliterationSearchResult[]> {
    return this.apiClient
      .fetchJson(`/textsearch?${stringify({ transliteration })}`, true)
      .then((result) =>
        result.map((dto) => ({
          ...dto,
          matchingLines: dto.matchingLines.map(fromLineDto),
        }))
      )
  }

  updateAlignment(
    id: ChapterId,
    alignment: ChapterAlignment
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(`${createChapterUrl(id)}/alignment`, toAlignmentDto(alignment))
      .then(fromChapterDto)
  }

  updateLemmatization(
    id: ChapterId,
    lemmatization: ChapterLemmatization
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `${createChapterUrl(id)}/lemmatization`,
        toLemmatizationDto(lemmatization)
      )
      .then(fromChapterDto)
  }

  updateManuscripts(
    id: ChapterId,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[]
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `${createChapterUrl(id)}/manuscripts`,
        toManuscriptsDto(manuscripts, uncertainChapters)
      )
      .then(fromChapterDto)
  }

  updateLines(id: ChapterId, lines: readonly Line[]): Bluebird<Chapter> {
    return this.apiClient
      .postJson(`${createChapterUrl(id)}/lines`, toLinesDto(lines))
      .then(fromChapterDto)
  }

  importChapter(id: ChapterId, atf: string): Bluebird<Chapter> {
    return this.apiClient
      .postJson(`${createChapterUrl(id)}/import`, { atf })
      .then(fromChapterDto)
  }

  findSuggestions(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService
    ).createLemmatization(chapter)
  }
}

import Bluebird from 'bluebird'
import { produce, castDraft } from 'immer'
import { stringify } from 'query-string'

import {
  fromChapterDto,
  fromDictionaryLineDto,
  fromDto,
  fromManuscriptDto,
  fromSiglumAndTransliterationDto,
} from 'corpus/application/dtos'
import TextServiceCache, {
  createChapterUrl,
  createTextUrl,
  preloadProvenances,
} from 'corpus/application/textServiceCore'
import { Chapter, DictionaryLineDisplay } from 'corpus/domain/chapter'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { Manuscript } from 'corpus/domain/manuscript'
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Text } from 'corpus/domain/text'
import FragmentService from 'fragmentarium/application/FragmentService'
import ApiClient from 'http/ApiClient'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryResult } from 'query/QueryResult'
import { ChapterSlugs, TextSlugs } from 'router/sitemapConfig'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { TextId } from 'transliteration/domain/text-id'

export default class TextServiceRead {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly fragmentService: FragmentService,
    private readonly referenceInjector: ReferenceInjector,
    private readonly cache: TextServiceCache,
  ) {}

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
              .then((title) => ({ ...chapter, title })),
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
      preloadProvenances(this.fragmentService),
      this.apiClient.fetchJson<Record<string, unknown>>(
        createChapterUrl(id),
        false,
      ),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  findColophons(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.findTransliterations(id, 'colophons')
  }

  findUnplacedLines(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.findTransliterations(id, 'unplaced_lines')
  }

  findExtantLines(id: ChapterId): Bluebird<ExtantLines> {
    return this.apiClient.fetchJson<ExtantLines>(
      `${createChapterUrl(id)}/extant_lines`,
      false,
    )
  }

  findManuscripts(id: ChapterId): Bluebird<Manuscript[]> {
    return Bluebird.all([
      preloadProvenances(this.fragmentService),
      this.apiClient.fetchJson<unknown[]>(
        `${createChapterUrl(id)}/manuscripts`,
        false,
      ),
    ]).then(([, manuscripts]) => manuscripts.map(fromManuscriptDto))
  }

  list(): Bluebird<Text[]> {
    return this.cache.getTexts(() =>
      this.apiClient
        .fetchJson<unknown[]>('/texts', false)
        .then((dtos) => dtos.map(fromDto)),
    )
  }

  searchLemma(
    lemmaId: string,
    genre: string | null | undefined,
  ): Bluebird<DictionaryLineDisplay[]> {
    return this.apiClient
      .fetchJson<
        unknown[]
      >(`/lemmasearch?${stringify({ lemma: lemmaId, genre })}`, false)
      .then((dtos) => dtos.map(fromDictionaryLineDto))
  }

  query(query: CorpusQuery): Bluebird<CorpusQueryResult> {
    this.cache.clearWhenScopeChanges()
    return this.apiClient.fetchJson<CorpusQueryResult>(
      `/corpus/query?${stringify(query)}`,
      false,
    )
  }

  listAllTexts(): Bluebird<TextSlugs> {
    return this.apiClient.fetchJson<TextSlugs>('/corpus/texts/all', false)
  }

  listAllChapters(): Bluebird<ChapterSlugs> {
    return this.apiClient.fetchJson<ChapterSlugs>('/corpus/chapters/all', false)
  }

  private findTransliterations(
    id: ChapterId,
    path: 'colophons' | 'unplaced_lines',
  ): Bluebird<SiglumAndTransliteration[]> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/${path}`, false)
      .then(fromSiglumAndTransliterationDto)
      .then((entries) =>
        Bluebird.all(
          entries.map(({ siglum, text }) =>
            this.referenceInjector
              .injectReferencesToText(text)
              .then((injectedText) => ({ siglum, text: injectedText })),
          ),
        ),
      )
  }
}

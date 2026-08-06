import { stringify } from 'query-string'

import { Chapter, DictionaryLineDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { Manuscript } from 'corpus/domain/manuscript'

import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Text } from 'corpus/domain/text'
import { fromDictionaryLineDto, fromDto, fromManuscriptDto } from './dtos'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryResult } from 'query/QueryResult'
import { ChapterSlugs, TextSlugs } from 'router/sitemapConfig'

import { createChapterUrl } from 'corpus/application/chapterUrls'
import CorpusLemmatizationFactory from 'corpus/application/CorpusLemmatizationFactory'

import TextServiceCore from 'corpus/application/TextServiceCore'

import { defaultCacheScope } from 'corpus/application/textServiceConstants'

export class TextServiceBase extends TextServiceCore {
  findColophons(id: ChapterId): Promise<SiglumAndTransliteration[]> {
    return this.fetchSiglaAndTransliterations(id, 'colophons')
  }

  findUnplacedLines(id: ChapterId): Promise<SiglumAndTransliteration[]> {
    return this.fetchSiglaAndTransliterations(id, 'unplaced_lines')
  }

  findExtantLines(id: ChapterId, signal?: AbortSignal): Promise<ExtantLines> {
    return this.apiClient.fetchJson<ExtantLines>(
      `${createChapterUrl(id)}/extant_lines`,
      false,
      signal,
    )
  }

  findManuscripts(id: ChapterId): Promise<Manuscript[]> {
    return Promise.all([
      this.loadProvenances(),
      this.apiClient.fetchJson<unknown[]>(
        `${createChapterUrl(id)}/manuscripts`,
        false,
      ),
    ]).then(([, manuscripts]) => manuscripts.map(fromManuscriptDto))
  }

  list(): Promise<Text[]> {
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
    signal?: AbortSignal,
  ): Promise<DictionaryLineDisplay[]> {
    return this.apiClient
      .fetchJson<unknown[]>(
        `/lemmasearch?${stringify({
          lemma: lemmaId,
          genre: genre,
        })}`,
        false,
        signal,
      )
      .then((dtos) => dtos.map(fromDictionaryLineDto))
  }

  query(query: CorpusQuery): Promise<CorpusQueryResult> {
    this.clearCachesWhenScopeChanges()
    return this.apiClient.fetchJson<CorpusQueryResult>(
      `/corpus/query?${stringify(query)}`,
      false,
    )
  }

  findSuggestions(chapter: Chapter): Promise<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService,
    ).createLemmatization(chapter)
  }

  listAllTexts(): Promise<TextSlugs> {
    return this.apiClient.fetchJson<TextSlugs>('/corpus/texts/all', false)
  }

  listAllChapters(): Promise<ChapterSlugs> {
    return this.apiClient.fetchJson<ChapterSlugs>('/corpus/chapters/all', false)
  }

  protected clearAllCaches(): void {
    this.cachedTexts = null
    this.cachedChapterDisplays.clear()
    this.cachedChapterDisplayRequests.clear()
  }

  protected clearCachesWhenScopeChanges(): void {
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

  protected resolveCacheScope(): string {
    try {
      return this.getCacheScope()
    } catch {
      return defaultCacheScope
    }
  }

  protected createChapterDisplayCacheKey(
    id: ChapterId,
    lines: readonly number[] = [],
    variants: readonly number[] = [],
  ): string {
    return `${createChapterUrl(id)}?${stringify({ lines, variants })}`
  }
}

export default TextServiceBase

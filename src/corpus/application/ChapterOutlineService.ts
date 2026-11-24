import { createChapterUrl } from 'corpus/application/chapterUrls'
import { fromLineDto } from 'corpus/application/dtos'
import {
  ChapterOutline,
  LinesPageDto,
} from 'corpus/application/edit-lite/chapterOutline'
import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
import { createChapterEndpointUrl } from 'corpus/application/edit-lite/chapterRequests'
import {
  createLineLemmatization,
  LemmaSuggestionsDto,
} from 'corpus/application/edit-lite/lineLemmatization'
import TextReadService from 'corpus/application/TextReadService'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import { ChapterId } from 'transliteration/domain/chapter-id'

export interface ChapterLinesOptions {
  readonly revision?: string
  readonly tokens?: boolean
}

export class ChapterOutlineService extends TextReadService {
  findChapterOutline(
    id: ChapterId,
    signal?: AbortSignal,
  ): Promise<ChapterOutline> {
    return this.apiClient.fetchJson<ChapterOutline>(
      `${createChapterUrl(id)}/outline`,
      false,
      signal,
    )
  }

  findChapterLines(
    id: ChapterId,
    offset: number,
    limit: number,
    signal?: AbortSignal,
    revisionOrOptions?: string | ChapterLinesOptions,
  ): Promise<readonly Line[]> {
    const { revision, tokens }: ChapterLinesOptions =
      typeof revisionOrOptions === 'object'
        ? revisionOrOptions
        : { revision: revisionOrOptions }
    return this.apiClient
      .fetchJson<LinesPageDto>(
        createChapterEndpointUrl(id, 'lines', {
          offset,
          limit,
          revision,
          tokens: tokens ? 'true' : undefined,
        }),
        false,
        signal,
      )
      .then((page) => page.lines.map(fromLineDto))
  }

  findLineSuggestions(line: Line): Promise<LineLemmatization[]> {
    return createLineLemmatization(line, {
      findSuggestions: (words) =>
        this.apiClient.postJson<LemmaSuggestionsDto[]>(
          '/lemmas/batch',
          { words },
          false,
        ),
      findWords: (ids) => this.wordService.findAll(ids),
    })
  }

  searchDictionaryLemma(query: string): Promise<readonly Word[]> {
    return this.wordService.searchLemma(query)
  }

  createDictionaryProperNoun(
    lemma: string,
    namedEntityTag: string,
  ): Promise<Word> {
    return this.wordService.createProperNoun(lemma, namedEntityTag)
  }

  countWordInstances(
    id: ChapterId,
    word: string,
    revision?: string,
  ): Promise<WordInstances> {
    return this.apiClient.fetchJson<WordInstances>(
      createChapterEndpointUrl(id, 'lemmatization/instances', {
        word,
        revision,
      }),
      false,
    )
  }
}

export default ChapterOutlineService

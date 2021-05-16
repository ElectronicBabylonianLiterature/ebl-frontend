import Bluebird from 'bluebird'
import _ from 'lodash'
import { stringify } from 'query-string'
import { ChapterAlignment } from 'corpus/domain/alignment'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import { Line, LineVariant, ManuscriptLine } from 'corpus/domain/line'
import { Chapter, Manuscript, Text, TextInfo } from 'corpus/domain/text'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { AbstractLemmatizationFactory } from 'fragmentarium/application/LemmatizationFactory'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Token } from 'transliteration/domain/token'
import {
  fromChapterDto,
  fromDto,
  fromLineDto,
  toAlignmentDto,
  toLemmatizationDto,
  toLinesDto,
  toManuscriptsDto,
} from './dtos'
import ApiClient from 'http/ApiClient'
import TransliterationSearchResult from 'corpus/domain/TransliterationSearchResult'

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

export default class TextService {
  private readonly apiClient: ApiClient
  private readonly wordService: WordService
  private readonly fragmentService: FragmentService

  constructor(
    apiClient: ApiClient,
    fragmentService: FragmentService,
    wordService: WordService
  ) {
    this.apiClient = apiClient
    this.fragmentService = fragmentService
    this.wordService = wordService
  }

  find(category: string, index: string): Bluebird<Text> {
    return this.apiClient
      .fetchJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`,
        true
      )
      .then(fromDto)
  }

  findChapter(
    category: string,
    index: string,
    stage: string,
    name: string
  ): Bluebird<Chapter> {
    return this.apiClient
      .fetchJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(name)}`,
        true
      )
      .then(fromChapterDto)
  }

  list(): Bluebird<TextInfo[]> {
    return this.apiClient.fetchJson('/texts', false)
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
    category: number,
    index: number,
    stage: string,
    name: string,
    alignment: ChapterAlignment
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(
          name
        )}/alignment`,
        toAlignmentDto(alignment)
      )
      .then(fromChapterDto)
  }

  updateLemmatization(
    category: number,
    index: number,
    stage: string,
    name: string,
    lemmatization: ChapterLemmatization
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(
          name
        )}/lemmatization`,
        toLemmatizationDto(lemmatization)
      )
      .then(fromChapterDto)
  }

  updateManuscripts(
    category: number,
    index: number,
    stage: string,
    name: string,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[]
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(
          name
        )}/manuscripts`,
        toManuscriptsDto(manuscripts, uncertainChapters)
      )
      .then(fromChapterDto)
  }

  updateLines(
    category: number,
    index: number,
    stage: string,
    name: string,
    lines: readonly Line[]
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(
          name
        )}/lines`,
        toLinesDto(lines)
      )
      .then(fromChapterDto)
  }

  importChapter(
    category: number,
    index: number,
    stage: string,
    name: string,
    atf: string
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(
          name
        )}/import`,
        { atf }
      )
      .then(fromChapterDto)
  }

  findSuggestions(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService
    ).createLemmatization(chapter)
  }
}

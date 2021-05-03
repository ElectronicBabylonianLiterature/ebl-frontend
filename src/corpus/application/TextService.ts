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
          matchingChapters: dto.matchingChapters.map((chapterDto) => ({
            ...chapterDto,
            matchingLines: chapterDto.matchingLines.map(fromLineDto),
          })),
        }))
      )
  }

  updateAlignment(
    category: number,
    index: number,
    chapterIndex: number,
    alignment: ChapterAlignment
  ): Bluebird<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/alignment`,
        toAlignmentDto(alignment)
      )
      .then(fromDto)
  }

  updateLemmatization(
    category: number,
    index: number,
    chapterIndex: number,
    lemmatization: ChapterLemmatization
  ): Bluebird<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/lemmatization`,
        toLemmatizationDto(lemmatization)
      )
      .then(fromDto)
  }

  updateManuscripts(
    category: number,
    index: number,
    chapterIndex: number,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[]
  ): Bluebird<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/manuscripts`,
        toManuscriptsDto(manuscripts, uncertainChapters)
      )
      .then(fromDto)
  }

  updateLines(
    category: number,
    index: number,
    chapterIndex: number,
    lines: readonly Line[]
  ): Bluebird<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/lines`,
        toLinesDto(lines)
      )
      .then(fromDto)
  }

  importChapter(
    category: number,
    index: number,
    chapterIndex: number,
    atf: string
  ): Bluebird<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/import`,
        { atf }
      )
      .then(fromDto)
  }

  findSuggestions(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService
    ).createLemmatization(chapter)
  }
}

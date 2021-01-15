import Promise from 'bluebird'
import _ from 'lodash'
import {
  Chapter,
  Line,
  LineVariant,
  Manuscript,
  ManuscriptLine,
  Text,
  TextInfo,
} from 'corpus/domain/text'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import {
  fromDto,
  toAlignmentDto,
  toLemmatizationDto,
  toLinesDto,
  toManuscriptsDto,
} from './dtos'
import { AbstractLemmatizationFactory } from 'fragmentarium/application/LemmatizationFactory'
import { ChapterAlignment } from 'corpus/domain/alignment'
import ApiClient from 'http/ApiClient'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Token } from 'transliteration/domain/token'

class CorpusLemmatizationFactory extends AbstractLemmatizationFactory<
  Chapter,
  ChapterLemmatization
> {
  createLemmatization(chapter: Chapter): Promise<ChapterLemmatization> {
    return Promise.mapSeries(chapter.lines, (line) =>
      Promise.mapSeries(line.variants, (variant) =>
        this.lemmatizeVariant(variant)
      )
    )
  }

  private lemmatizeVariant(variant: LineVariant): Promise<LineLemmatization> {
    return this.createLemmatizationLine(variant.reconstructionTokens)
      .then((reconstruction) =>
        reconstruction.map((token) => token.applySuggestion())
      )
      .then((reconstruction) =>
        Promise.mapSeries(variant.manuscripts, (manuscript) =>
          this.lemmatizeManuscript(manuscript, reconstruction)
        ).then((lemmatizedManuscripts) => [
          reconstruction,
          lemmatizedManuscripts,
        ])
      )
  }

  private lemmatizeManuscript(
    manuscript: ManuscriptLine,
    reconstruction: LemmatizationToken[]
  ): Promise<LemmatizationToken[]> {
    return this.createLemmatizationLine(manuscript.atfTokens).then(
      (lemmatizedManuscript) =>
        lemmatizedManuscript.map((lemmatizationToken, tokenIndex) => {
          const atfToken: Token = manuscript.atfTokens[tokenIndex]
          return lemmatizationToken.lemmatizable
            ? this.applySuggestion(lemmatizationToken, atfToken, reconstruction)
            : lemmatizationToken
        })
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

  find(category: string, index: string): Promise<Text> {
    return this.apiClient
      .fetchJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`,
        true
      )
      .then(fromDto)
  }

  list(): Promise<TextInfo[]> {
    return this.apiClient.fetchJson('/texts', false)
  }

  updateAlignment(
    category: number,
    index: number,
    chapterIndex: number,
    alignment: ChapterAlignment
  ): Promise<Text> {
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
  ): Promise<Text> {
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
    manuscripts: readonly Manuscript[]
  ): Promise<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/manuscripts`,
        toManuscriptsDto(manuscripts)
      )
      .then(fromDto)
  }

  updateLines(
    category: number,
    index: number,
    chapterIndex: number,
    lines: readonly Line[]
  ): Promise<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/lines`,
        toLinesDto(lines)
      )
      .then(fromDto)
  }

  findSuggestions(chapter: Chapter): Promise<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService
    ).createLemmatization(chapter)
  }
}

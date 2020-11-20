import Promise from 'bluebird'
import { TextInfo, Manuscript, Line, Text, Chapter } from 'corpus/domain/text'
import Bluebird from 'bluebird'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Word from 'dictionary/domain/Word'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { Token } from 'transliteration/domain/token'
import Lemma from 'transliteration/domain/Lemma'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import {
  fromDto,
  toAlignmentDto,
  toLemmatizationDto,
  toManuscriptsDto,
  toLinesDto,
} from './dtos'

function findSuggestions(
  fragmentService: FragmentService,
  wordService: WordService,
  tokens: readonly Token[]
): Promise<LemmatizationToken[]> {
  return Promise.mapSeries(tokens, (token) =>
    fragmentService
      .findSuggestions(token.cleanValue, token.normalized ?? false)
      .then((suggestions) =>
        token.lemmatizable
          ? Promise.all(
              token.uniqueLemma?.map((value) =>
                wordService.find(value).then((word: Word) => new Lemma(word))
              ) ?? []
            ).then(
              (lemmas) =>
                new LemmatizationToken(
                  token.value,
                  token.lemmatizable,
                  lemmas,
                  suggestions
                )
            )
          : new LemmatizationToken(token.value, false)
      )
  )
}

export default class TextService {
  private readonly apiClient
  private readonly wordService: WordService
  private readonly fragmentService: FragmentService

  constructor(
    apiClient,
    fragmentService: FragmentService,
    wordService: WordService
  ) {
    this.apiClient = apiClient
    this.fragmentService = fragmentService
    this.wordService = wordService
  }

  find(category: number, index: number): Bluebird<Text> {
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

  updateAlignment(
    category: number,
    index: number,
    chapterIndex: number,
    lines: readonly Line[]
  ): Bluebird<Text> {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/alignment`,
        toAlignmentDto(lines)
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
    manuscripts: readonly Manuscript[]
  ): Bluebird<Text> {
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

  findSuggestions(chapter: Chapter): Promise<ChapterLemmatization> {
    return Promise.mapSeries(chapter.lines, (line) =>
      Promise.all([
        findSuggestions(
          this.fragmentService,
          this.wordService,
          line.reconstructionTokens
        ),
        Promise.mapSeries(line.manuscripts, (manuscript) =>
          findSuggestions(
            this.fragmentService,
            this.wordService,
            manuscript.atfTokens
          )
        ),
      ])
    )
  }
}

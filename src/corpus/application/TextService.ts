import Bluebird from 'bluebird'
import { TextInfo, Manuscript, Line, Text, Chapter } from 'corpus/domain/text'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import {
  fromDto,
  toLemmatizationDto,
  toManuscriptsDto,
  toLinesDto,
  toAlignmentDto,
} from './dtos'
import { AbstractLemmatizationFactory } from 'fragmentarium/application/LemmatizationFactory'
import { ChapterAlignment } from 'corpus/domain/alignment'

class CorpusLemmatizationFactory extends AbstractLemmatizationFactory<
  Chapter,
  ChapterLemmatization
> {
  createLemmatization(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return Bluebird.mapSeries(chapter.lines, (line) =>
      Bluebird.mapSeries(line.variants, (variant) =>
        Bluebird.all([
          this.createLemmatizationLine(variant.reconstructionTokens),
          Bluebird.mapSeries(variant.manuscripts, (manuscript) =>
            this.createLemmatizationLine(manuscript.atfTokens)
          ),
        ])
      )
    )
  }
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

  findSuggestions(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService
    ).createLemmatization(chapter)
  }
}

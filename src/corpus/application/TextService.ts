import Bluebird from 'bluebird'
import _ from 'lodash'
import { stringify } from 'query-string'
import { ChapterAlignment } from 'corpus/domain/alignment'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import { Line, LineVariant, ManuscriptLine } from 'corpus/domain/line'
import { Chapter, Text } from 'corpus/domain/text'
import { Manuscript } from 'corpus/domain/manuscript'
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
  fromColophonsDto,
  fromDto,
  fromLineDto,
  toAlignmentDto,
  toLemmatizationDto,
  toLinesDto,
  toManuscriptsDto,
} from './dtos'
import ApiClient from 'http/ApiClient'
import TransliterationSearchResult from 'corpus/domain/TransliterationSearchResult'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import BibliographyService from 'bibliography/application/BibliographyService'
import Colophon from 'corpus/domain/Colophon'

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

function createChapterUrl(
  genre: string,
  category: string | number,
  index: string | number,
  stage: string,
  name: string
): string {
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
    this.apiClient = apiClient
    this.fragmentService = fragmentService
    this.wordService = wordService
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  find(genre: string, category: string, index: string): Bluebird<Text> {
    return this.apiClient
      .fetchJson(createTextUrl(genre, category, index), true)
      .then(fromDto)
  }

  findChapter(
    genre: string,
    category: string,
    index: string,
    stage: string,
    name: string
  ): Bluebird<Chapter> {
    return this.apiClient
      .fetchJson(createChapterUrl(genre, category, index, stage, name), true)
      .then(fromChapterDto)
  }

  findColophons(
    genre: string,
    category: string,
    index: string,
    stage: string,
    name: string
  ): Bluebird<Colophon[]> {
    return this.apiClient
      .fetchJson(
        `${createChapterUrl(genre, category, index, stage, name)}/colophons`,
        true
      )
      .then(fromColophonsDto)
      .then((colophons) =>
        Bluebird.all(
          colophons.map(({ siglum, text }) =>
            this.referenceInjector.injectReferences(text).then((text) => ({
              siglum,
              text,
            }))
          )
        )
      )
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
    genre: string,
    category: number,
    index: number,
    stage: string,
    name: string,
    alignment: ChapterAlignment
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `${createChapterUrl(genre, category, index, stage, name)}/alignment`,
        toAlignmentDto(alignment)
      )
      .then(fromChapterDto)
  }

  updateLemmatization(
    genre: string,
    category: number,
    index: number,
    stage: string,
    name: string,
    lemmatization: ChapterLemmatization
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `${createChapterUrl(
          genre,
          category,
          index,
          stage,
          name
        )}/lemmatization`,
        toLemmatizationDto(lemmatization)
      )
      .then(fromChapterDto)
  }

  updateManuscripts(
    genre: string,
    category: number,
    index: number,
    stage: string,
    name: string,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[]
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `${createChapterUrl(genre, category, index, stage, name)}/manuscripts`,
        toManuscriptsDto(manuscripts, uncertainChapters)
      )
      .then(fromChapterDto)
  }

  updateLines(
    genre: string,
    category: number,
    index: number,
    stage: string,
    name: string,
    lines: readonly Line[]
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `${createChapterUrl(genre, category, index, stage, name)}/lines`,
        toLinesDto(lines)
      )
      .then(fromChapterDto)
  }

  importChapter(
    genre: string,
    category: number,
    index: number,
    stage: string,
    name: string,
    atf: string
  ): Bluebird<Chapter> {
    return this.apiClient
      .postJson(
        `${createChapterUrl(genre, category, index, stage, name)}/import`,
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

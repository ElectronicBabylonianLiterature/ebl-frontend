import Bluebird from 'bluebird'

import BibliographyService from 'bibliography/application/BibliographyService'
import { LineVariantDisplayDto } from 'corpus/application/dtos'
import TextServiceDisplay from 'corpus/application/TextServiceDisplay'
import TextServiceRead from 'corpus/application/TextServiceRead'
import TextServiceWrite from 'corpus/application/TextServiceWrite'
import TextServiceCache, {
  defaultCacheScope,
} from 'corpus/application/textServiceCore'
import { ChapterAlignment } from 'corpus/domain/alignment'
import {
  Chapter,
  ChapterDisplay,
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { LineDetails } from 'corpus/domain/line-details'
import { Manuscript } from 'corpus/domain/manuscript'
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Text } from 'corpus/domain/text'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ApiClient from 'http/ApiClient'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryResult } from 'query/QueryResult'
import { ChapterSlugs, TextSlugs } from 'router/sitemapConfig'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { TextId } from 'transliteration/domain/text-id'

export { createChapterUrl } from 'corpus/application/textServiceCore'

export default class TextService {
  private readonly read: TextServiceRead
  private readonly display: TextServiceDisplay
  private readonly write: TextServiceWrite

  constructor(
    apiClient: ApiClient,
    fragmentService: FragmentService,
    wordService: WordService,
    bibliographyService: BibliographyService,
    getCacheScope: () => string = () => defaultCacheScope,
  ) {
    const referenceInjector = new ReferenceInjector(bibliographyService)
    const cache = new TextServiceCache(getCacheScope)
    this.read = new TextServiceRead(
      apiClient,
      fragmentService,
      referenceInjector,
      cache,
    )
    this.display = new TextServiceDisplay(
      apiClient,
      fragmentService,
      referenceInjector,
      cache,
    )
    this.write = new TextServiceWrite(apiClient, fragmentService, wordService)
  }

  find(id: TextId): Bluebird<Text> {
    return this.read.find(id)
  }

  findChapter(id: ChapterId): Bluebird<Chapter> {
    return this.read.findChapter(id)
  }

  findChapterDisplay(
    id: ChapterId,
    lines: readonly number[] = [],
    variants: readonly number[] = [],
  ): Bluebird<ChapterDisplay> {
    return this.display.findChapterDisplay(id, lines, variants)
  }

  findLineVariant(
    variant: LineVariantDisplayDto,
    isPrimaryVariant: boolean,
  ): Bluebird<LineVariantDisplay> {
    return this.display.findLineVariant(variant, isPrimaryVariant)
  }

  findChapterLine(
    id: ChapterId,
    number: number,
    variantNumber: number,
  ): Bluebird<LineDetails> {
    return this.display.findChapterLine(id, number, variantNumber)
  }

  findColophons(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.read.findColophons(id)
  }

  findUnplacedLines(id: ChapterId): Bluebird<SiglumAndTransliteration[]> {
    return this.read.findUnplacedLines(id)
  }

  findExtantLines(id: ChapterId): Bluebird<ExtantLines> {
    return this.read.findExtantLines(id)
  }

  findManuscripts(id: ChapterId): Bluebird<Manuscript[]> {
    return this.read.findManuscripts(id)
  }

  list(): Bluebird<Text[]> {
    return this.read.list()
  }

  searchLemma(
    lemmaId: string,
    genre: string | null | undefined = null,
  ): Bluebird<DictionaryLineDisplay[]> {
    return this.read.searchLemma(lemmaId, genre)
  }

  query(query: CorpusQuery): Bluebird<CorpusQueryResult> {
    return this.read.query(query)
  }

  updateAlignment(
    id: ChapterId,
    alignment: ChapterAlignment,
  ): Bluebird<Chapter> {
    return this.write.updateAlignment(id, alignment)
  }

  updateLemmatization(
    id: ChapterId,
    lemmatization: ChapterLemmatization,
  ): Bluebird<Chapter> {
    return this.write.updateLemmatization(id, lemmatization)
  }

  updateManuscripts(
    id: ChapterId,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[],
  ): Bluebird<Chapter> {
    return this.write.updateManuscripts(id, manuscripts, uncertainChapters)
  }

  updateLines(id: ChapterId, lines: readonly Line[]): Bluebird<Chapter> {
    return this.write.updateLines(id, lines)
  }

  importChapter(id: ChapterId, atf: string): Bluebird<Chapter> {
    return this.write.importChapter(id, atf)
  }

  findSuggestions(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return this.write.findSuggestions(chapter)
  }

  listAllTexts(): Bluebird<TextSlugs> {
    return this.read.listAllTexts()
  }

  listAllChapters(): Bluebird<ChapterSlugs> {
    return this.read.listAllChapters()
  }
}

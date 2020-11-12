import Reference from 'bibliography/domain/Reference'
import Promise from 'bluebird'
import DictionaryWord from 'dictionary/domain/Word'
import Annotation from 'fragmentarium/domain/annotation'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
  LemmatizationDto,
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import ReferenceInjector from './ReferenceInjector'
import { Genres } from 'fragmentarium/domain/Genres'
import { LemmatizableToken, Token } from 'transliteration/domain/token'

export interface CdliInfo {
  readonly photoUrl: string | null
  readonly lineArtUrl: string | null
  readonly detailLineArtUrl: string | null
}

export interface ImageRepository {
  find(fileName: string): Promise<Blob>
  findFolio(folio: Folio): Promise<Blob>
  findPhoto(number: string): Promise<Blob>
}

export interface FragmentRepository {
  statistics(): Promise<any>
  find(number: string): Promise<Fragment>
  fetchGenres(): Promise<string[][]>
  updateGenres(number: string, genres: Genres): Promise<Fragment>
  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ): Promise<Fragment>
  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto
  ): Promise<Fragment>
  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>
  ): Promise<Fragment>
  folioPager(folio: Folio, fragmentNumber: string): Promise<any>
  fragmentPager(fragmentNumber: string): Promise<any>
  findLemmas(lemma: string, isNormalized: boolean): Promise<any>
  fetchCdliInfo(cdliNumber: string): Promise<CdliInfo>
}

export interface AnnotationRepository {
  findAnnotations(number: string): Promise<readonly Annotation[]>
  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Promise<readonly Annotation[]>
}
class FragmentService {
  private readonly fragmentRepository
  private readonly imageRepository
  private readonly wordRepository
  private readonly bibliographyService
  private readonly referenceInjector: ReferenceInjector

  constructor(
    fragmentRepository: FragmentRepository & AnnotationRepository,
    imageRepository: ImageRepository,
    wordRepository: any,
    bibliographyService: any
  ) {
    this.fragmentRepository = fragmentRepository
    this.imageRepository = imageRepository
    this.wordRepository = wordRepository
    this.bibliographyService = bibliographyService
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  statistics() {
    return this.fragmentRepository.statistics()
  }

  find(number: string): Promise<Fragment> {
    return this.fragmentRepository
      .find(number)
      .then((fragment: Fragment) =>
        this.referenceInjector.injectReferences(fragment)
      )
  }
  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    return this.fragmentRepository
      .updateGenres(number, genres)
      .then((fragment: Fragment) =>
        this.referenceInjector.injectReferences(fragment)
      )
  }

  fetchGenres(): Promise<string[][]> {
    return this.fragmentRepository.fetchGenres()
  }

  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateTransliteration(number, transliteration, notes)
      .then((fragment: Fragment) =>
        this.referenceInjector.injectReferences(fragment)
      )
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateLemmatization(number, lemmatization)
      .then((fragment: Fragment) =>
        this.referenceInjector.injectReferences(fragment)
      )
  }

  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateReferences(number, references)
      .then((fragment: Fragment) =>
        this.referenceInjector.injectReferences(fragment)
      )
  }

  findFolio(folio: Folio) {
    return this.imageRepository.findFolio(folio)
  }

  findImage(fileName: string) {
    return this.imageRepository.find(fileName)
  }

  findPhoto(fragment: Fragment) {
    return fragment.hasPhoto
      ? this.imageRepository.findPhoto(fragment.number)
      : Promise.resolve(null)
  }

  folioPager(folio: Folio, fragmentNumber: string) {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
  }

  fragmentPager(fragmentNumber: string) {
    return this.fragmentRepository.fragmentPager(fragmentNumber)
  }

  searchLemma(lemma: string) {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  searchBibliography(query: string) {
    return this.bibliographyService.search(query)
  }

  fetchCdliInfo(fragment: Fragment) {
    return fragment.cdliNumber
      ? this.fragmentRepository.fetchCdliInfo(fragment.cdliNumber)
      : Promise.resolve({
          photoUrl: null,
          lineArtUrl: null,
          detailLineArtUrl: null,
        })
  }

  findAnnotations(number: string): Promise<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number)
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Promise<readonly Annotation[]> {
    return this.fragmentRepository.updateAnnotations(number, annotations)
  }

  createLemmatization(text: Text): Promise<Lemmatization> {
    return Promise.all(
      text.allLines.map((line) => this.createLemmatizationLine(line.content))
    ).then(
      (lines) =>
        new Lemmatization(
          text.allLines.map((line) => line.prefix),
          lines
        )
    )
  }

  private createLemmatizationLine(
    tokens: readonly Token[]
  ): Promise<LemmatizationToken[]> {
    return Promise.all(
      tokens.map((token) =>
        token.lemmatizable
          ? Promise.all([
              this.createLemmas(token),
              this.createSuggestions(token),
            ]).then(
              ([lemmas, suggestions]) =>
                new LemmatizationToken(token.value, true, lemmas, suggestions)
            )
          : Promise.resolve(new LemmatizationToken(token.value, false))
      )
    )
  }

  private createSuggestions(
    token: LemmatizableToken
  ): Promise<readonly UniqueLemma[]> {
    return _.isEmpty(token.uniqueLemma)
      ? this.findSuggestions(token.cleanValue, token.normalized)
      : Promise.resolve([])
  }

  private createLemmas(token: LemmatizableToken): Promise<UniqueLemma> {
    return Promise.all(
      token.uniqueLemma.map((lemma) =>
        this.wordRepository
          .find(lemma)
          .then((word: DictionaryWord) => new Lemma(word))
      )
    )
  }

  findSuggestions(
    value: string,
    isNormalized: boolean
  ): Promise<ReadonlyArray<UniqueLemma>> {
    return this.fragmentRepository
      .findLemmas(value, isNormalized)
      .then((lemmas) =>
        lemmas.map((complexLemma) =>
          complexLemma.map((word) => new Lemma(word))
        )
      )
  }
}

export default FragmentService

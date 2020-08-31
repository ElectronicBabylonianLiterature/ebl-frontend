import Reference from 'bibliography/domain/Reference'
import Promise from 'bluebird'
import Word from 'dictionary/domain/Word'
import Annotation from 'fragmentarium/domain/annotation'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import _, { Dictionary } from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
  LemmatizationDto,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import { Token } from 'transliteration/domain/token'
import ReferenceInjector from './ReferenceInjector'

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
  updateGenre(number: string, genre: string[][]): Promise<Fragment>
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
  findLemmas(lemma: string): Promise<any>
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
  updateGenre(number: string, genre: string[][]): Promise<Fragment> {
    return this.fragmentRepository.updateGenre(number, genre)
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
    return Promise.all([this.fetchLemmas(text), this.fetchSuggestions(text)])
      .then(([lemmaData, suggestionsData]): [
        Dictionary<Lemma>,
        Dictionary<ReadonlyArray<UniqueLemma>>
      ] => [_.keyBy(lemmaData, 'value'), _.fromPairs(suggestionsData)])
      .then(([lemmas, suggestions]) =>
        text.createLemmatization(lemmas, suggestions)
      )
  }

  private fetchLemmas(text: Text): Promise<Lemma[]> {
    return Promise.all(
      mapText<string, Promise<Lemma>>(
        text,
        (line) => line.flatMap((token) => token.uniqueLemma || []),
        (uniqueLemma: string): Promise<Lemma> =>
          this.wordRepository
            .find(uniqueLemma)
            .then((word: Word) => new Lemma(word))
      )
    )
  }

  private fetchSuggestions(
    text: Text
  ): Promise<ReadonlyArray<[string, ReadonlyArray<UniqueLemma>]>> {
    return Promise.mapSeries(
      mapLines(text, (line) =>
        line
          .filter((token) => token.lemmatizable && _.isEmpty(token.uniqueLemma))
          .flatMap((token) => token.cleanValue)
      ),
      (value: string): [string, ReadonlyArray<UniqueLemma>] =>
        this.fragmentRepository
          .findLemmas(value)
          .then((lemmas) => [
            value,
            lemmas.map((complexLemma) =>
              complexLemma.map((word) => new Lemma(word))
            ),
          ])
    )
  }
}

function mapText<T, U>(
  text: Text,
  mapLine: (tokens: ReadonlyArray<Token>) => ReadonlyArray<T>,
  mapToken: (token: T) => U
): ReadonlyArray<U> {
  return mapLines(text, mapLine).map(mapToken)
}

function mapLines<T>(
  text: Text,
  mapLine: (tokens: ReadonlyArray<Token>) => ReadonlyArray<T>
): ReadonlyArray<T> {
  return _(text.lines)
    .flatMap(({ content }) => mapLine(content))
    .reject(_.isNil)
    .uniq()
    .sort()
    .value()
}

export default FragmentService

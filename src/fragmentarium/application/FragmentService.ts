import _, { Dictionary } from 'lodash'
import produce, { Draft } from 'immer'
import Promise from 'bluebird'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import Reference from 'bibliography/domain/Reference'
import createReference from 'bibliography/application/createReference'
import { Text } from 'transliteration/domain/text'
import Annotation from 'fragmentarium/domain/annotation'
import Word from 'dictionary/domain/Word'
import { Token } from 'transliteration/domain/token'
import {
  isNoteLine,
  isBibliographyPart,
} from 'transliteration/domain/type-guards'

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
  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ): Promise<Fragment>
  updateLemmatization(
    number: string,
    lemmatization: Lemmatization
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
  }

  statistics() {
    return this.fragmentRepository.statistics()
  }

  async find(number: string): Promise<Fragment> {
    return this.fragmentRepository
      .find(number)
      .then((fragment: Fragment) => this.hydrateFragment(fragment))
  }

  async updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateTransliteration(number, transliteration, notes)
      .then((fragment: Fragment) => this.hydrateFragment(fragment))
  }

  async updateLemmatization(
    number: string,
    lemmatization: Lemmatization
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateLemmatization(number, lemmatization)
      .then((fragment: Fragment) => this.hydrateFragment(fragment))
  }

  async updateReferences(
    number: string,
    references: ReadonlyArray<Reference>
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateReferences(number, references)
      .then((fragment: Fragment) => this.hydrateFragment(fragment))
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

  async createLemmatization(text: Text): Promise<Lemmatization> {
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
          .filter((token) => token.lemmatizable)
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

  private async hydrateFragment(fragment: Fragment): Promise<Fragment> {
    return await this.hydrateReferences(fragment.references)
      .then((hydrated) => fragment.setReferences(hydrated))
      .then(
        produce(async (draft: Draft<Fragment>) => {
          await Promise.all(
            draft.text.allLines
              .filter(isNoteLine)
              .flatMap((line: any) => line.parts)
              .filter(isBibliographyPart)
              .map(async (part: any) => {
                part.reference = await createReference(
                  part.reference,
                  this.bibliographyService
                ).catch((error) => {
                  console.error(error)
                  return part.reference
                })
              })
          )
        })
      )
  }

  hydrateReferences(references: ReadonlyArray<any>): Promise<Reference[]> {
    const hydrate: (reference: any) => Promise<Reference> = (reference) =>
      createReference(reference, this.bibliographyService)
    return Promise.all<Reference>(references.map(hydrate))
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
    .value() as ReadonlyArray<T> // Null values are filtered by isNil
}

export default FragmentService

import _ from 'lodash'
import Promise from 'bluebird'
import Lemma from 'fragmentarium/domain/Lemma'
import Lemmatization from 'fragmentarium/domain/Lemmatization'
import { Folio, Fragment } from 'fragmentarium/domain/fragment'
import Reference from 'bibliography/domain/Reference'
import createReference from 'bibliography/application/createReference'
import { Text } from 'fragmentarium/domain/text'
import { Token } from 'fragmentarium/domain/text'

export interface CdliInfo {
  readonly photoUrl: string | null,
  lineArtUrl: string | null,
  detailLineArtUrl: string | null
}

export interface ImageRepository {
  find(fileName: string): Blob;
  findFolio(folio: Folio): Blob;
  findPhoto(number: string): Blob;
}

export interface FragmentRepository {
  statistics(): Promise<any>;
  find(number: string): Promise<Fragment>;
  updateTransliteration(number: string, transliteration: string, notes: string): Promise<Fragment>;
  updateLemmatization(number: string, lemmatization: Lemmatization): Promise<Fragment>;
  updateReferences(number: string, references: ReadonlyArray<Reference>): Promise<Fragment>;
  folioPager(folio: Folio, fragmentNumber: string): Promise<any>;
  findLemmas(lemma: string): Promise<any>;
  fetchCdliInfo(cdliNumber: string): Promise<CdliInfo>;
}

class FragmentService {
  private readonly fragmentRepository
  private readonly imageRepository
  private readonly wordRepository
  private readonly bibliographyService

  constructor(
    fragmentRepository: FragmentRepository,
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

  find(number: string) {
    return this.fragmentRepository
      .find(number)
      .then(fragment =>
        this.hydrateReferences(fragment.references).then(hydrated =>
          fragment.setReferences(hydrated)
        )
      )
  }

  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ) {
    return this.fragmentRepository.updateTransliteration(
      number,
      transliteration,
      notes
    )
  }

  updateLemmatization(number: string, lemmatization: Lemmatization) {
    return this.fragmentRepository.updateLemmatization(number, lemmatization)
  }

  updateReferences(number: string, references: ReadonlyArray<Reference>) {
    return this.fragmentRepository.updateReferences(number, references)
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
          detailLineArtUrl: null
        })
  }

  createLemmatization(text: Text) {
    return Promise.all([this._fetchLemmas(text), this._fetchSuggestions(text)])
      .then(([lemmaData, suggestionsData]) => [
        _.keyBy(lemmaData, 'value'),
        _.fromPairs(suggestionsData)
      ])
      .then(([lemmas, suggestions]) =>
        text.createLemmatization(lemmas, suggestions)
      )
  }

  _fetchLemmas(text: Text) {
    return Promise.all<ReadonlyArray<Lemma>>(
      mapText(
        text,
        line => line.map(token => token.uniqueLemma || []),
        uniqueLemma =>
          this.wordRepository.find(uniqueLemma).then(word => new Lemma(word))
      )
    )
  }

  _fetchSuggestions(
    text: Text
  ): Promise<ReadonlyArray<[string, ReadonlyArray<Lemma>]>> {
    return Promise.mapSeries<string, [string, ReadonlyArray<Lemma>], any>(
      mapLines(text, line =>
        line.filter(token => token.lemmatizable).map(token => token.value)
      ),
      (value: string): Promise<[string, ReadonlyArray<Lemma>]> =>
        this.fragmentRepository
          .findLemmas(value)
          .then(lemmas => [
            value,
            lemmas.map(complexLemma =>
              complexLemma.map(word => new Lemma(word))
            )
          ])
    )
  }

  hydrateReferences(references: ReadonlyArray<any>) {
    const hydrate: (reference: any) => Promise<Reference> = reference =>
      createReference(reference, this.bibliographyService)
    return Promise.all<Reference>(references.map(hydrate))
  }
}

function mapText<T, U>(
  text: Text,
  mapLine: (tokens: ReadonlyArray<Token>) => T | null,
  mapToken: (token: T) => U
): ReadonlyArray<U> {
  return mapLines(text, mapLine).map(mapToken)
}

function mapLines<T>(
  text: Text,
  mapLine: (tokens: ReadonlyArray<Token>) => ReadonlyArray<T | null> | T | null
): ReadonlyArray<T> {
  return _(text.lines)
    .flatMapDeep(({ content }) => mapLine(content))
    .reject(_.isNil)
    .uniq()
    .sort()
    .value()
}

export default FragmentService

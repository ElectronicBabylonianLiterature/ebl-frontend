// @flow
import _ from 'lodash'
import Promise from 'bluebird'
import Lemma from './lemmatization/Lemma'
import Lemmatization from './lemmatization/Lemmatization'
import { Folio } from './fragment'
import { Reference, createReference } from '../bibliography/Reference'
import { Text } from './text'
import type { Token } from './text'

export interface ImageRepository {
  find(string): Blob;
  findFolio(Folio): Blob;
  findPhoto(string): Blob;
}

class FragmentService {
  #fragmentRepository
  #imageRepository
  #wordRepository
  #bibliographyService

  constructor(
    fragmentRepository: any,
    imageRepository: ImageRepository,
    wordRepository: any,
    bibliographyService: any
  ) {
    this.#fragmentRepository = fragmentRepository
    this.#imageRepository = imageRepository
    this.#wordRepository = wordRepository
    this.#bibliographyService = bibliographyService
  }

  statistics() {
    return this.#fragmentRepository.statistics()
  }

  find(number: string) {
    return this.#fragmentRepository
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
    return this.#fragmentRepository.updateTransliteration(
      number,
      transliteration,
      notes
    )
  }

  updateLemmatization(number: string, lemmatization: Lemmatization) {
    return this.#fragmentRepository.updateLemmatization(number, lemmatization)
  }

  updateReferences(number: string, references: {}) {
    return this.#fragmentRepository.updateReferences(number, references)
  }

  findFolio(folio: Folio) {
    return this.#imageRepository.findFolio(folio)
  }

  findImage(fileName: string) {
    return this.#imageRepository.find(fileName)
  }

  findPhoto(number: string) {
    return this.#imageRepository.findPhoto(number)
  }

  folioPager(folio: string, fragmentNumber: string) {
    return this.#fragmentRepository.folioPager(folio, fragmentNumber)
  }

  searchLemma(lemma: string) {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.#wordRepository.searchLemma(lemma)
  }

  searchBibliography(query: string) {
    return this.#bibliographyService.search(query)
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
    return Promise.all<$ReadOnlyArray<Lemma>>(
      mapText(
        text,
        line => line.map(token => token.uniqueLemma || []),
        uniqueLemma =>
          this.#wordRepository.find(uniqueLemma).then(word => new Lemma(word))
      )
    )
  }

  _fetchSuggestions(
    text: Text
  ): Promise<$ReadOnlyArray<[string, $ReadOnlyArray<Lemma>]>> {
    return Promise.mapSeries<string, [string, $ReadOnlyArray<Lemma>], any>(
      mapLines(text, line =>
        line.filter(token => token.lemmatizable).map(token => token.value)
      ),
      (value: string): Promise<[string, $ReadOnlyArray<Lemma>]> =>
        this.#fragmentRepository
          .findLemmas(value)
          .then(lemmas => [
            value,
            lemmas.map(complexLemma =>
              complexLemma.map(word => new Lemma(word))
            )
          ])
    )
  }

  hydrateReferences(references: $ReadOnlyArray<{}>) {
    const hydrate: ({}) => Promise<Reference> = reference =>
      createReference(reference, this.#bibliographyService)
    return Promise.all<Reference>(references.map(hydrate))
  }
}

function mapText<T, U>(
  text: Text,
  mapLine: ($ReadOnlyArray<Token>) => ?T,
  mapToken: T => U
): $ReadOnlyArray<U> {
  return mapLines(text, mapLine).map(mapToken)
}

function mapLines<T>(
  text: Text,
  mapLine: ($ReadOnlyArray<Token>) => $ReadOnlyArray<?T> | ?T
): $ReadOnlyArray<T> {
  return _(text.lines)
    .flatMapDeep(({ content }) => mapLine(content))
    .reject(_.isNil)
    .uniq()
    .sort()
    .value()
}

export default FragmentService

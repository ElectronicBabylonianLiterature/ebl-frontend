// @flow
import _ from 'lodash'
import { List } from 'immutable'
import { Promise } from 'bluebird'
import Lemma from './lemmatization/Lemma'
import { createReference } from '../bibliography/Reference'

class FragmentService {
  constructor(
    fragmentRepository,
    imageRepository,
    wordRepository,
    bibliographyService
  ) {
    this.fragmentRepository = fragmentRepository
    this.imageRepository = imageRepository
    this.wordRepository = wordRepository
    this.bibliographyService = bibliographyService
  }

  statistics() {
    return this.fragmentRepository.statistics()
  }

  find(number) {
    return this.fragmentRepository
      .find(number)
      .then(fragment =>
        this.hydrateReferences(fragment.references.toJS()).then(hydrated =>
          fragment.setReferences(hydrated)
        )
      )
  }

  random() {
    return this.fragmentRepository.random().then(_.head)
  }

  interesting() {
    return this.fragmentRepository.interesting().then(_.head)
  }

  searchNumber(number) {
    return this.fragmentRepository.searchNumber(number)
  }

  searchTransliteration(transliteration) {
    return this.fragmentRepository.searchTransliteration(transliteration)
  }

  fetchLatestTransliterations() {
    return this.fragmentRepository.fetchLatestTransliterations()
  }

  fetchNeedsRevision() {
    return this.fragmentRepository.fetchNeedsRevision()
  }

  updateTransliteration(number, transliteration, notes) {
    return this.fragmentRepository.updateTransliteration(
      number,
      transliteration,
      notes
    )
  }

  updateLemmatization(number, lemmatization) {
    return this.fragmentRepository.updateLemmatization(number, lemmatization)
  }

  updateReferences(number, references) {
    return this.fragmentRepository.updateReferences(number, references)
  }

  findFolio(folio) {
    return this.imageRepository.find(folio.fileName, true)
  }

  findImage(fileName) {
    return this.imageRepository.find(fileName, false)
  }

  folioPager(folio, fragmentNumber) {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
  }

  searchLemma(lemma) {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  searchBibliography(query) {
    return this.bibliographyService.search(query)
  }

  createLemmatization(text) {
    return Promise.all([this._fetchLemmas(text), this._fetchSuggestions(text)])
      .then(([lemmaData, suggestionsData]) => [
        _.keyBy(lemmaData, 'value'),
        _.fromPairs(suggestionsData)
      ])
      .then(([lemmas, suggestions]) =>
        text.createLemmatization(lemmas, suggestions)
      )
  }

  _fetchLemmas(text) {
    return Promise.all(
      mapText(
        text,
        line => line.map(token => token.get('uniqueLemma', List())),
        uniqueLemma =>
          this.wordRepository.find(uniqueLemma).then(word => new Lemma(word))
      )
    )
  }

  _fetchSuggestions(text) {
    return Promise.mapSeries(
      mapLines(text, line =>
        line
          .filter(token => token.get('lemmatizable', false))
          .map(token => token.get('value'))
      ),
      value =>
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

  hydrateReferences(references) {
    const hydrate = reference =>
      createReference(reference, this.bibliographyService)
    return Promise.all(references.map(hydrate)).then(List)
  }
}

function mapText(text, mapLine, mapToken) {
  return mapLines(text, mapLine).map(mapToken)
}

function mapLines(text, mapLine) {
  return text.lines
    .toSeq()
    .map(({ content }) => mapLine(content))
    .flatten(false)
    .filterNot(_.isNil)
    .toOrderedSet()
}

export default FragmentService

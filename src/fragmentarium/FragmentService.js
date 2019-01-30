import _ from 'lodash'
import { Promise } from 'bluebird'
import Lemmatization, { LemmatizationToken } from 'fragmentarium/lemmatization/Lemmatization'
import Lemma from 'fragmentarium/lemmatization/Lemma'

class FragmentService {
  constructor (auth, fragmentRepository, imageRepository, wordRepository, bibliographyRepository) {
    this.auth = auth
    this.fragmentRepository = fragmentRepository
    this.imageRepository = imageRepository
    this.wordRepository = wordRepository
    this.bibliographyRepository = bibliographyRepository
  }

  statistics () {
    return this.fragmentRepository.statistics()
  }

  find (number) {
    return this.fragmentRepository.find(number)
  }

  random () {
    return this.fragmentRepository.random().then(_.head)
  }

  interesting () {
    return this.fragmentRepository.interesting().then(_.head)
  }

  searchNumber (number) {
    return this.fragmentRepository.searchNumber(number)
  }

  searchTransliteration (transliteration) {
    return this.fragmentRepository.searchTransliteration(transliteration)
  }

  updateTransliteration (number, transliteration, notes) {
    return this.fragmentRepository.updateTransliteration(number, transliteration, notes)
  }

  updateLemmatization (number, lemmatization) {
    return this.fragmentRepository.updateLemmatization(number, lemmatization)
  }

  updateReferences (number, references) {
    return this.fragmentRepository.updateReferences(number, references)
  }

  findFolio (folio) {
    return this.imageRepository.find(folio.fileName)
  }

  findImage () {
    const fileName = 'Babel_Project_01_cropped.svg'
    return this.imageRepository.find(fileName)
  }
  isAllowedToRead () {
    return this.auth.isAllowedToReadFragments()
  }

  isAllowedToTransliterate () {
    return this.auth.isAllowedToTransliterateFragments()
  }

  isAllowedToLemmatize () {
    return this.auth.isAllowedToLemmatizeFragments()
  }

  hasBetaAccess () {
    return this.auth.hasBetaAccess()
  }

  folioPager (folio, fragmentNumber) {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
  }

  searchLemma (lemma) {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  findBibliography (id) {
    return this.bibliographyRepository.find(id)
  }

  searchBibliography (query) {
    const queryRegex = /^([^\d]+)(?: (\d{4})(?: (.*))?)?$/
    const match = queryRegex.exec(query)
    return match
      ? this.bibliographyRepository.search(
        match[1],
        match[2] || '',
        match[3] || ''
      )
      : Promise.resolve([])
  }

  createLemmatization (text) {
    return Promise.all([
      this._fetchLemmas(text),
      this._fetchSuggestions(text)
    ]).then(([lemmaData, suggestionsData]) => {
      const lemmas = _.keyBy(lemmaData, 'value')
      const suggestions = _.fromPairs(suggestionsData)
      return new Lemmatization(
        _.map(text.lines, 'prefix'),
        _(text.lines)
          .map('content')
          .map(tokens => tokens.map(token => token.lemmatizable
            ? new LemmatizationToken(
              token.value,
              true,
              token.uniqueLemma.map(id => lemmas[id]),
              suggestions[token.value]
            )
            : new LemmatizationToken(token.value, false))
          )
          .value()
      )
    })
  }

  _fetchLemmas (text) {
    return Promise.all(
      mapText(
        text,
        line => line.map(token => token.uniqueLemma),
        uniqueLemma => this.wordRepository.find(uniqueLemma).then(word => new Lemma(word))
      )
    )
  }

  _fetchSuggestions (text) {
    return Promise.all(
      mapText(
        text,
        line => line.filter(token => token.lemmatizable).map(token => token.value),
        value => this.fragmentRepository.findLemmas(value).then(result => [
          value,
          result.map(complexLemma => complexLemma.map(word => new Lemma(word)))
        ])
      )
    )
  }
}

function mapText (text, mapLine, mapToken) {
  return _(text.lines)
    .map('content')
    .map(mapLine)
    .flattenDeep()
    .compact()
    .uniq()
    .map(mapToken)
    .value()
}

export default FragmentService

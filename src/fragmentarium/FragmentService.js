import _ from 'lodash'
import { List } from 'immutable'
import { Promise } from 'bluebird'
import Lemmatization, {
  LemmatizationToken
} from 'fragmentarium/lemmatization/Lemmatization'
import Lemma from 'fragmentarium/lemmatization/Lemma'
import { createReference } from 'bibliography/Reference'

class FragmentService {
  constructor (
    auth,
    fragmentRepository,
    imageRepository,
    wordRepository,
    bibliographyService
  ) {
    this.auth = auth
    this.fragmentRepository = fragmentRepository
    this.imageRepository = imageRepository
    this.wordRepository = wordRepository
    this.bibliographyService = bibliographyService
  }

  statistics () {
    return this.fragmentRepository.statistics()
  }

  find (number) {
    return this.fragmentRepository
      .find(number)
      .then(fragment =>
        this.hydrateReferences(fragment.references).then(hydrated =>
          fragment.setReferences(hydrated)
        )
      )
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

  fetchLatestTransliterations () {
    return this.fragmentRepository.fetchLatestTransliterations()
  }

  updateTransliteration (number, transliteration, notes) {
    return this.fragmentRepository.updateTransliteration(
      number,
      transliteration,
      notes
    )
  }

  updateLemmatization (number, lemmatization) {
    return this.fragmentRepository.updateLemmatization(number, lemmatization)
  }

  updateReferences (number, references) {
    return this.fragmentRepository.updateReferences(number, references)
  }

  findFolio (folio) {
    return this.imageRepository.find(folio.fileName, true)
  }

  findImage (fileName) {
    return this.imageRepository.find(fileName, false)
  }

  folioPager (folio, fragmentNumber) {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
  }

  searchLemma (lemma) {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  searchBibliography (query) {
    return this.bibliographyService.search(query)
  }

  createLemmatization (text) {
    return Promise.all([
      this._fetchLemmas(text),
      this._fetchSuggestions(text)
    ]).then(([lemmaData, suggestionsData]) => {
      const lemmas = _.keyBy(lemmaData, 'value')
      const suggestions = _.fromPairs(suggestionsData)
      return new Lemmatization(
        text.lines.map(line => line.prefix).toJS(),
        text.lines
          .toSeq()
          .map(line => line.content)
          .map(tokens =>
            tokens.map(token =>
              token.get('lemmatizable', false)
                ? new LemmatizationToken(
                  token.get('value'),
                  true,
                  token
                    .get('uniqueLemma', [])
                    .map(id => lemmas[id])
                    .toJS(),
                  suggestions[token.get('value')]
                )
                : new LemmatizationToken(token.get('value'), false)
            )
          )
          .toJS()
      )
    })
  }

  _fetchLemmas (text) {
    return Promise.all(
      mapText(
        text,
        line => line.map(token => token.get('uniqueLemma', List())),
        uniqueLemma =>
          this.wordRepository.find(uniqueLemma).then(word => new Lemma(word))
      )
    )
  }

  _fetchSuggestions (text) {
    return Promise.all(
      mapText(
        text,
        line =>
          line
            .filter(token => token.get('lemmatizable', false))
            .map(token => token.get('value')),
        value =>
          this.fragmentRepository
            .findLemmas(value)
            .then(result => [
              value,
              result.map(complexLemma =>
                complexLemma.map(word => new Lemma(word))
              )
            ])
      )
    )
  }

  hydrateReferences (references) {
    const hydrate = reference =>
      createReference(reference, this.bibliographyService)
    return Promise.all(references.map(hydrate)).then(List)
  }
}

function mapText (text, mapLine, mapToken) {
  return text.lines
    .toSeq()
    .map(({ content }) => mapLine(content))
    .flatten(false)
    .filterNot(_.isNil)
    .toOrderedSet()
    .map(mapToken)
}

export default FragmentService

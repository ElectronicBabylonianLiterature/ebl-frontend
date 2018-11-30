import _ from 'lodash'
import { Promise } from 'bluebird'

class FragmentService {
  constructor (auth, fragmentRepository, imageRepository, wordRepository) {
    this.auth = auth
    this.fragmentRepository = fragmentRepository
    this.imageRepository = imageRepository
    this.wordRepository = wordRepository
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

  findFolio (folio) {
    return this.imageRepository.find(folio.fileName)
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

  folioPager (folio, fragmentNumber) {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
  }

  searchLemma (lemma) {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }
}

export default FragmentService

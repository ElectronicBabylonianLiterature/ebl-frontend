import _ from 'lodash'

class FragmentService {
  constructor (auth, fragmentRepository, imageRepository) {
    this.auth = auth
    this.fragmentRepository = fragmentRepository
    this.imageRepository = imageRepository
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

  findFolio ({ name, number }) {
    return this.imageRepository.find(`${name}_${number}.jpg`)
  }

  allowedToRead () {
    const scope = this.auth.applicationScopes.readFragments
    return this.auth.isAllowedTo(scope)
  }

  allowedToTransliterate () {
    const scope = this.auth.applicationScopes.transliterateFragments
    return this.auth.isAllowedTo(scope)
  }
}

export default FragmentService

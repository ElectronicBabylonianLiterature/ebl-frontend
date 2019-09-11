// @flow
import _ from 'lodash'
import { Promise } from 'bluebird'
import type { FragmentInfo } from './fragment'

export type FragmentInfosPromise = Promise<$ReadOnlyArray<FragmentInfo>>
export type FragmentInfoPromise = Promise<FragmentInfo>

export interface FragmentInfoRepository {
  random(): FragmentInfosPromise;
  interesting(): FragmentInfosPromise;
  searchNumber(string): FragmentInfosPromise;
  searchTransliteration(string): FragmentInfosPromise;
  fetchLatestTransliterations(): FragmentInfosPromise;
  fetchNeedsRevision(): FragmentInfosPromise;
}

export default class FragmentSearchService {
  #fragmentRepository

  constructor(fragmentRepository: FragmentInfoRepository) {
    this.#fragmentRepository = fragmentRepository
  }

  random(): FragmentInfoPromise {
    return this.#fragmentRepository.random().then(_.head)
  }

  interesting(): FragmentInfoPromise {
    return this.#fragmentRepository.interesting().then(_.head)
  }

  searchNumber(number: string): FragmentInfosPromise {
    return this.#fragmentRepository.searchNumber(number)
  }

  searchTransliteration(transliteration: string): FragmentInfosPromise {
    return this.#fragmentRepository.searchTransliteration(transliteration)
  }

  fetchLatestTransliterations(): FragmentInfosPromise {
    return this.#fragmentRepository.fetchLatestTransliterations()
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this.#fragmentRepository.fetchNeedsRevision()
  }
}

import _ from 'lodash'
import Promise from 'bluebird'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

export type FragmentInfosPromise = Promise<ReadonlyArray<FragmentInfo>>
export type FragmentInfoPromise = Promise<FragmentInfo>

export interface FragmentInfoRepository {
  random(): FragmentInfosPromise
  interesting(): FragmentInfosPromise
  searchNumber(number: string): FragmentInfosPromise
  searchTransliteration(number: string): FragmentInfosPromise
  fetchLatestTransliterations(): FragmentInfosPromise
  fetchNeedsRevision(): FragmentInfosPromise
}

export default class FragmentSearchService {
  private readonly fragmentRepository: FragmentInfoRepository

  constructor(fragmentRepository: FragmentInfoRepository) {
    this.fragmentRepository = fragmentRepository
  }

  random(): FragmentInfoPromise {
    return this.fragmentRepository
      .random()
      .then(_.head)
      .then(info => {
        if (info) {
          return info
        } else {
          throw new Error('No fragments found.')
        }
      })
  }

  interesting(): FragmentInfoPromise {
    return this.fragmentRepository
      .interesting()
      .then(_.head)
      .then(info => {
        if (info) {
          return info
        } else {
          throw new Error('No fragments found.')
        }
      })
  }

  searchNumber(number: string): FragmentInfosPromise {
    return this.fragmentRepository.searchNumber(number)
  }

  searchTransliteration(transliteration: string): FragmentInfosPromise {
    return this.fragmentRepository.searchTransliteration(transliteration)
  }

  fetchLatestTransliterations(): FragmentInfosPromise {
    return this.fragmentRepository.fetchLatestTransliterations()
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this.fragmentRepository.fetchNeedsRevision()
  }
}

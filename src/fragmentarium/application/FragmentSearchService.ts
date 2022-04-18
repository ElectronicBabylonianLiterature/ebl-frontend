import _ from 'lodash'
import Promise from 'bluebird'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

export type FragmentInfosPromise = Promise<ReadonlyArray<FragmentInfo>>
export type FragmentInfoPromise = Promise<FragmentInfo>

export interface FragmentInfoRepository {
  random(): FragmentInfosPromise
  interesting(): FragmentInfosPromise
  searchFragmentarium(
    number: string,
    transliteration: string,
    id: string,
    pages: string
  ): FragmentInfosPromise
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
      .then((info) => {
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
      .then((info) => {
        if (info) {
          return info
        } else {
          throw new Error('No fragments found.')
        }
      })
  }

  searchFragmentarium(
    number: string,
    transliteration: string,
    id: string,
    pages: string
  ): FragmentInfosPromise {
    return this.fragmentRepository.searchFragmentarium(
      number,
      transliteration,
      id,
      pages
    )
  }

  fetchLatestTransliterations(): FragmentInfosPromise {
    return this.fragmentRepository.fetchLatestTransliterations()
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this.fragmentRepository.fetchNeedsRevision()
  }
}

import _ from 'lodash'
import Promise from 'bluebird'
import {
  FragmentInfo,
  FragmentInfosPagination,
} from 'fragmentarium/domain/fragment'
import { createFragmentInfo } from 'fragmentarium/infrastructure/FragmentRepository'

export type FragmentInfosPromise = Promise<ReadonlyArray<FragmentInfo>>
export type FragmentInfoPromise = Promise<FragmentInfo>
export type FragmentInfosPaginationPromise = Promise<FragmentInfosPagination>

export interface FragmentInfoRepository {
  random(): FragmentInfosPromise
  interesting(): FragmentInfosPromise
  searchFragmentarium(
    number: string,
    transliteration: string,
    id: string,
    pages: string,
    paginationIndex: number
  ): FragmentInfosPaginationPromise
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
          return createFragmentInfo(info)
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
          return createFragmentInfo(info)
        } else {
          throw new Error('No fragments found.')
        }
      })
  }

  searchFragmentarium(
    number: string,
    transliteration: string,
    bibliographyId: string,
    pages: string,
    paginationIndex: number
  ): FragmentInfosPaginationPromise {
    return this.fragmentRepository.searchFragmentarium(
      number,
      transliteration,
      bibliographyId,
      pages,
      paginationIndex
    )
  }

  fetchLatestTransliterations(): FragmentInfosPromise {
    return this.fragmentRepository
      .fetchLatestTransliterations()
      .then((fragmentInfos) => fragmentInfos.map(createFragmentInfo))
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this.fragmentRepository
      .fetchNeedsRevision()
      .then((fragmentInfos) => fragmentInfos.map(createFragmentInfo))
  }
}

import _ from 'lodash'
import Promise from 'bluebird'
import {
  FragmentInfo,
  FragmentInfoDto,
  FragmentInfosPagination,
} from 'fragmentarium/domain/fragment'

export type FragmentInfosPromise = Promise<ReadonlyArray<FragmentInfo>>
export type FragmentInfosDtoPromise = Promise<ReadonlyArray<FragmentInfoDto>>
export type FragmentInfoPromise = Promise<FragmentInfo>
export type FragmentInfosPaginationPromise = Promise<FragmentInfosPagination>

export interface FragmentInfoRepository {
  random(): FragmentInfosPromise
  interesting(): FragmentInfosPromise
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

  fetchNeedsRevision(): FragmentInfosPromise {
    return this.fragmentRepository.fetchNeedsRevision()
  }
}

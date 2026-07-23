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
  random(signal?: AbortSignal): FragmentInfosPromise
  interesting(signal?: AbortSignal): FragmentInfosPromise
  fetchNeedsRevision(signal?: AbortSignal): FragmentInfosPromise
}

export default class FragmentSearchService {
  private readonly fragmentRepository: FragmentInfoRepository

  constructor(fragmentRepository: FragmentInfoRepository) {
    this.fragmentRepository = fragmentRepository
  }

  random(signal?: AbortSignal): FragmentInfoPromise {
    return this.fragmentRepository.random(signal).then((infos) => {
      const info = infos[0]
      if (info) {
        return info
      }
      throw new Error('No fragments found.')
    })
  }

  interesting(signal?: AbortSignal): FragmentInfoPromise {
    return this.fragmentRepository.interesting(signal).then((infos) => {
      const info = infos[0]
      if (info) {
        return info
      }
      throw new Error('No fragments found.')
    })
  }

  fetchNeedsRevision(signal?: AbortSignal): FragmentInfosPromise {
    return this.fragmentRepository.fetchNeedsRevision(signal)
  }
}

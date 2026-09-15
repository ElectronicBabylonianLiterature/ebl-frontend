import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult } from 'query/QueryResult'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  bibliographyService,
  createFragmentService,
} from 'fragmentarium/application/fragmentService.testSupport'

export {
  bibliographyService,
  fragmentRepository,
  imageRepository,
  withExpiredCacheTimestamp,
  wordRepository,
} from 'fragmentarium/application/fragmentService.testSupport'

export const number = 'K.1'
export const query: FragmentQuery = { lemmas: 'ina I', number: number }
export const reorderedQuery: FragmentQuery = { number: number, lemmas: 'ina I' }
export const edition = {
  transliteration: '1. kur',
  notes: 'notes',
  introduction: 'intro',
}

export const createScopedService = (
  getCacheScope: () => string,
): FragmentService => createFragmentService(getCacheScope)

export interface CacheTestFixtures {
  service: FragmentService
  cachedFragment: Fragment
  updatedFragment: Fragment
  queryResult: QueryResult
  updatedQueryResult: QueryResult
}

export function setupCacheTest(): CacheTestFixtures {
  jest.clearAllMocks()
  bibliographyService.findMany.mockResolvedValue([])

  return {
    service: createFragmentService(),
    cachedFragment: fragmentFactory.build({ number: number }),
    updatedFragment: fragmentFactory.build({ number: number }),
    queryResult: {
      items: [{ museumNumber: number, matchingLines: [], matchCount: 1 }],
      matchCountTotal: 1,
    },
    updatedQueryResult: { items: [], matchCountTotal: 0 },
  }
}

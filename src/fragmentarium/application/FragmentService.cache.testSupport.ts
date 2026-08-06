import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryResult } from 'query/QueryResult'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  createFragmentServiceTestContext,
  FragmentServiceTestContext,
} from 'fragmentarium/application/FragmentService.testSupport'

export const cacheTtlMilliseconds = 5 * 60 * 1000
export const cachedFragmentNumber = 'K.1'

export interface CacheTestContext extends FragmentServiceTestContext {
  cachedFragment: Fragment
  updatedFragment: Fragment
  queryResult: QueryResult
  updatedQueryResult: QueryResult
}

export const query = { lemmas: 'ina I', number: cachedFragmentNumber }
export const edition = {
  transliteration: '1. kur',
  notes: 'notes',
  introduction: 'intro',
}

export function createCacheTestContext(): CacheTestContext {
  const context = createFragmentServiceTestContext()

  context.bibliographyService.find.mockImplementation((id: string) =>
    Promise.reject(new Error(`${id} not found.`)),
  )
  context.bibliographyService.findMany.mockResolvedValue([])

  return {
    ...context,
    cachedFragment: fragmentFactory.build({ number: cachedFragmentNumber }),
    updatedFragment: fragmentFactory.build({ number: cachedFragmentNumber }),
    queryResult: {
      items: [
        {
          museumNumber: cachedFragmentNumber,
          matchingLines: [],
          matchCount: 1,
        },
      ],
      matchCountTotal: 1,
    },
    updatedQueryResult: { items: [], matchCountTotal: 0 },
  }
}

export async function withExpiredCacheTimestamp(
  runTest: (expireCache: () => void) => PromiseLike<void> | void,
): Promise<void> {
  let currentTime = 0
  const dateNow = jest.spyOn(Date, 'now').mockImplementation(() => currentTime)
  const expireCache = (): void => {
    currentTime = cacheTtlMilliseconds + 1
  }

  try {
    await runTest(expireCache)
  } finally {
    dateNow.mockRestore()
  }
}

export function buildQueryResultWithPrefetchedFragment(
  fragment: Fragment,
  matchingLines: readonly number[],
): QueryResult {
  return {
    items: [
      {
        museumNumber: cachedFragmentNumber,
        matchingLines: matchingLines,
        matchCount: 1,
        fragment: fragment,
      } as QueryResult['items'][number],
    ],
    matchCountTotal: 1,
  }
}

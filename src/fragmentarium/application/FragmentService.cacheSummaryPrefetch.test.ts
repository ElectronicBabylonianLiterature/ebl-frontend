import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  fragmentRepository,
  number,
  query,
  setupCacheTest,
} from 'fragmentarium/application/fragmentServiceCache.testSupport'

let service: FragmentService
let cachedFragment: Fragment
let summaryFragment: Fragment

function summaryItem(museumNumber: string, matchingLines: number[]): QueryItem {
  return {
    museumNumber,
    matchingLines,
    matchCount: matchingLines.length,
    fragment: summaryFragment,
    cardSummary: { type: 'FragmentCardSummary' },
    thumbnailPath: null,
  }
}

function fullItem(museumNumber: string, fragment: Fragment): QueryItem {
  return {
    museumNumber,
    matchingLines: [1, 2, 3, 4],
    matchCount: 4,
    fragment,
  }
}

function queryResultOf(items: readonly QueryItem[]): QueryResult {
  return { items, matchCountTotal: items.length }
}

beforeEach(() => {
  ;({ service, cachedFragment } = setupCacheTest())
  summaryFragment = fragmentFactory.build({ number: number, record: [] })
})

describe('card summary prefetch isolation', () => {
  test('does not serve a card summary to the full fragment page', async () => {
    fragmentRepository.query.mockReturnValue(
      Promise.resolve(queryResultOf([summaryItem(number, [1, 2])])),
    )
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await service.query(query)

    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)

    await expect(service.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('does not serve a card summary under the matching lines key', async () => {
    fragmentRepository.query.mockReturnValue(
      Promise.resolve(queryResultOf([summaryItem(number, [1, 2, 3, 4])])),
    )
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await service.query(query)
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      { number: cachedFragment.number },
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('does not serve a card summary for a number without matching lines', async () => {
    fragmentRepository.query.mockReturnValue(
      Promise.resolve(queryResultOf([summaryItem(number, [])])),
    )
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await service.query(query)
    await expect(service.find(number, [], true)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('does not prefetch unsupported card summaries', async () => {
    fragmentRepository.query.mockReturnValue(
      Promise.resolve(
        queryResultOf([
          {
            ...summaryItem(number, [1, 2]),
            cardSummary: { type: 'UnsupportedFragmentCardSummary' },
          },
        ]),
      ),
    )
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await service.query(query)
    await expect(service.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('still prefetches full fragments alongside card summaries', async () => {
    const otherNumber = 'K.2'
    const otherFragment = fragmentFactory.build({ number: otherNumber })

    fragmentRepository.query.mockReturnValue(
      Promise.resolve(
        queryResultOf([
          summaryItem(number, [1, 2]),
          fullItem(otherNumber, otherFragment),
        ]),
      ),
    )
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await service.query(query)

    await expect(service.find(otherNumber)).resolves.toMatchObject({
      number: otherNumber,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)

    await expect(service.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })
})

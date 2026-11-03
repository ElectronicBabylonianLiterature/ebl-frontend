import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  legacyMatchingIndexes,
  ordinaryFragment,
  ordinarySourceLines,
} from 'fragmentarium/ui/search/fragmentMatchHydration.testSupport'
import {
  fragmentService,
  renderFragmentLines,
  resetFragmentLineMocks,
} from 'fragmentarium/ui/search/ExpandableFragmentMatches.testSupport'
import {
  SUMMARY_LEMMA_ID,
  tokenWithClass,
} from 'test-support/fragment-query-preview'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(resetFragmentLineMocks)

function visibleSourceIndexes(): number[] {
  return within(screen.getByRole('table'))
    .getAllByRole('row')
    .map((row) => Number(row.textContent?.match(/source-(\d+)/)?.[1]))
}

it.each([
  {
    name: 'ordinary indexless DTO lines',
    matchingLines: legacyMatchingIndexes,
    requestIndexes: [100, 101, 102],
    initialIndexes: [100, 101, 102],
    nextBatch: 3,
  },
  {
    name: 'indexless DTO lines around a requested NoteLine and duplicate',
    matchingLines: [100, 100, 50, 101, ...legacyMatchingIndexes],
    requestIndexes: [100, 50, 101],
    initialIndexes: [100, 101],
    nextBatch: 4,
  },
])('retains hydrated source identities for $name', async (fixture) => {
  const sourceLines = ordinarySourceLines()
  expect(
    sourceLines
      .filter((line) => line.type === 'TextLine')
      .every((line) => !('index' in line)),
  ).toBe(true)
  fragmentService.find.mockImplementation(async (_number, indexes) =>
    ordinaryFragment(
      indexes ? indexes.map((index) => sourceLines[index]) : sourceLines,
    ),
  )
  renderFragmentLines(
    {
      museumNumber: 'K.1',
      matchingLines: fixture.matchingLines,
      matchCount: 16,
      totalMatchingLines: 16,
    },
    3,
    [SUMMARY_LEMMA_ID],
  )

  await screen.findByRole('button', { name: 'Show 10 more matching lines' })
  expect(visibleSourceIndexes()).toEqual(fixture.initialIndexes)
  expect(fragmentService.find.mock.calls).toEqual([
    ['K.1', fixture.requestIndexes, false],
  ])
  const firstExpandedIndexes = [
    ...Array.from({ length: 10 }, (_unused, index) => index),
    ...fixture.initialIndexes,
  ]
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matching lines' }),
  )
  await waitFor(() =>
    expect(visibleSourceIndexes()).toEqual(firstExpandedIndexes),
  )
  expect(
    visibleSourceIndexes().filter(
      (index) => !fixture.initialIndexes.includes(index),
    ),
  ).toHaveLength(10)
  expect(
    screen.getAllByText(
      tokenWithClass('Transliteration__Word--highlight', 'kur'),
    ),
  ).toHaveLength(firstExpandedIndexes.length)
  expect(screen.getAllByRole('link', { name: 'o. 7' })[0]).toHaveAttribute(
    'href',
    '/library/K.1#o%207',
  )

  await userEvent.click(
    screen.getByRole('button', {
      name: `Show ${fixture.nextBatch} more matching lines`,
    }),
  )
  expect(visibleSourceIndexes()).toEqual(
    [...legacyMatchingIndexes].sort((first, second) => first - second),
  )
  expect(
    screen.queryByRole('button', { name: /more matching lines/ }),
  ).not.toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse matching lines' }),
  )
  expect(visibleSourceIndexes()).toEqual(fixture.initialIndexes)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matching lines' }),
  )
  expect(visibleSourceIndexes()).toEqual(firstExpandedIndexes)
  expect(fragmentService.find.mock.calls).toEqual([
    ['K.1', fixture.requestIndexes, false],
    ['K.1'],
  ])
})

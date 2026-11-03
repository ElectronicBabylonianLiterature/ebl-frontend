import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  previewLine,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import { createFragmentCardSummary } from 'test-support/fragment-query-summary'
import {
  fragmentService,
  renderFragmentLines,
  resetFragmentLineMocks,
} from 'fragmentarium/ui/search/ExpandableFragmentMatches.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(resetFragmentLineMocks)

function visibleLabels(): (string | null)[] {
  return within(screen.getByRole('table'))
    .getAllByRole('cell')
    .filter((cell) =>
      cell.classList.contains('fragment-lines-with-lemma__line-number'),
    )
    .map((cell) => cell.textContent)
}

function labels(indexes: readonly number[]): string[] {
  return indexes.map((index) => `o. ${index + 1}`)
}

const firstTenIndexes = Array.from({ length: 10 }, (_unused, index) => index)
const unorderedIndexes = [100, 101, 102, 103, 104, ...firstTenIndexes, 10]
const orderedIndexes = Array.from({ length: 16 }, (_unused, index) => index)

it.each([
  {
    name: 'unordered backend preview',
    matchingLines: unorderedIndexes,
    previewIndexes: [100, 101, 102, 103, 104],
    firstExpandedIndexes: [...firstTenIndexes, 100, 101, 102],
  },
  {
    name: 'ordered preview control',
    matchingLines: orderedIndexes,
    previewIndexes: [0, 1, 2, 3, 4],
    firstExpandedIndexes: orderedIndexes.slice(0, 13),
  },
])('preserves visible rows and bounded batches for $name', async (fixture) => {
  const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
  const fullLines = Array.from({ length: 105 }, (_unused, index) => ({
    ...previewLine(index + 1, []),
    location: { object: null, surface: 'o', column: null, sealNumber: null },
  }))
  fragmentService.find.mockResolvedValueOnce(withPreviewLines(base, fullLines))
  renderFragmentLines(
    {
      museumNumber: base.number,
      matchingLines: fixture.matchingLines,
      matchCount: 16,
      totalMatchingLines: 16,
      fragment: withPreviewLines(
        base,
        fixture.previewIndexes.map((index) => fullLines[index]),
      ),
      cardSummary: createFragmentCardSummary(),
    },
    3,
  )
  const initialIndexes = fixture.previewIndexes.slice(0, 3)
  expect(visibleLabels()).toEqual(labels(initialIndexes))
  expect(fragmentService.find).not.toHaveBeenCalled()

  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matching lines' }),
  )
  await waitFor(() =>
    expect(visibleLabels()).toEqual(labels(fixture.firstExpandedIndexes)),
  )
  expect(screen.getAllByRole('row')).toHaveLength(13)
  expect(visibleLabels()).toEqual(
    expect.arrayContaining(labels(initialIndexes)),
  )
  expect(
    visibleLabels().filter(
      (label) => !labels(initialIndexes).includes(label ?? ''),
    ),
  ).toHaveLength(10)
  expect(
    screen.getByRole('link', { name: labels([initialIndexes[2]])[0] }),
  ).toHaveAttribute(
    'href',
    expect.stringContaining(`o%20${initialIndexes[2] + 1}`),
  )

  await userEvent.click(
    screen.getByRole('button', { name: 'Show 3 more matching lines' }),
  )
  expect(visibleLabels()).toEqual(
    labels([...fixture.matchingLines].sort((first, second) => first - second)),
  )
  expect(screen.getAllByRole('row')).toHaveLength(16)
  expect(
    screen.queryByRole('button', { name: /more matching lines/ }),
  ).not.toBeInTheDocument()

  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse matching lines' }),
  )
  expect(visibleLabels()).toEqual(labels(initialIndexes))
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matching lines' }),
  )
  expect(visibleLabels()).toEqual(labels(fixture.firstExpandedIndexes))
  expect(fragmentService.find).toHaveBeenCalledTimes(1)
  expect(fragmentService.find).toHaveBeenCalledWith(base.number)
})

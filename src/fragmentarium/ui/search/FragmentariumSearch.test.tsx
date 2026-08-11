import { screen } from '@testing-library/react'
import {
  createFragmentariumSearchHarness,
  queryResult,
  FragmentariumSearchHarness,
} from './FragmentariumSearch.testSupport'

let harness: FragmentariumSearchHarness

beforeEach(() => {
  jest.clearAllMocks()
  harness = createFragmentariumSearchHarness()
})

test('renders the empty Library search page without querying results', async () => {
  harness.renderSearch()

  expect(
    await screen.findByText(
      'Search for fragments and chapters in the Library.',
    ),
  ).toBeVisible()
  expect(harness.fragmentService.query).not.toHaveBeenCalled()
})

test('fills in the search form query', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult())

  harness.renderSearch({ number: 'K.1' })

  expect(await screen.findByLabelText('Number')).toHaveValue('K.1')
  await screen.findByText('Found 0 chapters')
})

test('does not refetch on an equivalent query with a new object reference', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult())
  const transliteration = 'kur'

  const { rerender } = harness.renderSearch({ transliteration })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  expect(harness.fragmentService.query).toHaveBeenCalledTimes(1)

  rerender(harness.buildSearchElement({ transliteration }))

  expect(harness.fragmentService.query).toHaveBeenCalledTimes(1)
  await screen.findByText('Found 0 chapters')
})

test('labels inexact line totals without using page size as document total', async () => {
  harness.fragmentService.query.mockResolvedValue({
    ...queryResult(7, true),
    isMatchCountTotalExact: false,
  })

  harness.renderSearch({ transliteration: 'kur' })

  expect(
    await screen.findByText(
      'Found about 7 matching lines. Showing documents 1-1',
    ),
  ).toBeVisible()
  expect(screen.queryByText(/in 1 document/)).not.toBeInTheDocument()
  expect(
    screen.queryByText(/more results are available/),
  ).not.toBeInTheDocument()
  await screen.findByText('Found 0 chapters')
})

test('renders summary-backed rows without hydrating the fragment', async () => {
  const result = queryResult(7)
  harness.fragmentService.query.mockResolvedValue(result)

  harness.renderSearch({ lemmas: 'test-lemma' })

  expect(
    await screen.findByText('Found 7 matching lines. Showing documents 1-1'),
  ).toBeVisible()
  expect(harness.fragmentService.find).not.toHaveBeenCalled()
  expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
  expect(screen.getByText(result.items[0].museumNumber)).toBeVisible()
  await screen.findByText('Found 0 chapters')
})

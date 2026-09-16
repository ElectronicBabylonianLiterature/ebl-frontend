import { screen } from '@testing-library/react'
import {
  createFragmentariumSearchHarness,
  queryResult,
  FragmentariumSearchHarness,
} from './FragmentariumSearch.testSupport'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  createFragmentCardSummary,
  productionSummaryReferences,
  summaryBibliographyDocuments,
} from 'test-support/fragment-query-summary'
import {
  tokenWithClass,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import createReference from 'bibliography/application/createReference'
import { Fragment } from 'fragmentarium/domain/fragment'

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

test('keeps one bounded query and zero card hydration calls for 50 summaries', async () => {
  const summaryFragment = withPreviewLines(
    Fragment.create({
      ...fragmentFactory.build({ hasPhoto: true, dossiers: [] }),
      references: productionSummaryReferences.map((reference) =>
        createReference({
          ...reference,
          document: summaryBibliographyDocuments[reference.id],
        }),
      ),
    }),
  )
  const thumbnailPath = '/fragments/summary/thumbnail/small'
  harness.fragmentService.query.mockResolvedValue({
    items: Array.from({ length: 50 }, (_, index) => ({
      museumNumber: `Summary.${index + 1}`,
      matchingLines: [1, 2],
      matchCount: 2,
      fragment: summaryFragment,
      cardSummary: createFragmentCardSummary(),
      thumbnailPath,
    })),
    matchCountTotal: null,
    hasNextPage: false,
  })

  harness.renderSearch({ number: 'Summary' })

  expect(await screen.findAllByText(summaryFragment.number)).toHaveLength(50)
  expect(harness.fragmentService.query).toHaveBeenCalledTimes(1)
  expect(harness.fragmentService.query).toHaveBeenCalledWith({
    number: 'Summary',
    limit: 51,
    offset: 0,
    count: 'page',
  })
  expect(harness.fragmentService.find).not.toHaveBeenCalled()
  expect(harness.fragmentService.findThumbnail).not.toHaveBeenCalled()
  expect(harness.bibliographyService.find).not.toHaveBeenCalled()
  expect(harness.bibliographyService.findMany).not.toHaveBeenCalled()
  expect(screen.getAllByText(/Borger, 1957/).length).toBeGreaterThan(0)
  expect(
    screen.getAllByText(tokenWithClass('Transliteration__Reading', 'kur')),
  ).toHaveLength(50)
})

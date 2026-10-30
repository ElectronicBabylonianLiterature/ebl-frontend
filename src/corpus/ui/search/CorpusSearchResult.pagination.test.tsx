import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import { CorpusSearchResult } from 'corpus/ui/search/CorpusSearchResult'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryResult } from 'query/QueryResult'
import { corpusQueryItemFactory } from 'test-support/query-item-factory'

jest.mock('corpus/application/TextService')
jest.mock('common/hooks/useNearViewport', () => ({
  __esModule: true,
  default: () => ({ containerRef: () => undefined, isNearViewport: false }),
}))

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const criteria: CorpusQuery = { transliteration: 'a+b' }

function items(count: number, start = 1) {
  return Array.from({ length: count }, (_unused, index) =>
    corpusQueryItemFactory.build({
      name: `Chapter ${start + index}`,
      lines: [0],
      variants: [0],
      matchCount: 1,
    }),
  )
}

function RouteProbe(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output data-testid="route">{location.search + location.hash}</output>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </>
  )
}

function renderSearch(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CorpusSearchResult textService={textService} corpusQuery={criteria} />
      <RouteProbe />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('requests bounded pages, preserves the Corpus tab, and supports Back', async () => {
  textService.query.mockImplementation(
    async (query): Promise<CorpusQueryResult> => ({
      items: query.offset === 25 ? items(1, 26) : items(25),
      totalChapters: 26,
      matchCountTotal: 30,
      isMatchCountTotalExact: true,
      hasNextPage: query.offset === 0,
    }),
  )
  renderSearch(
    '/library/search/?transliteration=a%2Bb&paginationIndex=4&limit=100&corpusPaginationIndex=0&corpusLimit=25#corpus',
  )

  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 1-25 of 26',
    ),
  ).toBeVisible()
  expect(textService.query.mock.calls[0][0]).toEqual({
    transliteration: 'a+b',
    limit: 25,
    offset: 0,
  })
  expect(textService.findChapterDisplay).not.toHaveBeenCalled()
  expect(screen.getAllByText('Last')[0]).toHaveAttribute(
    'href',
    expect.stringContaining('corpusPaginationIndex=1&corpusLimit=25#corpus'),
  )

  await userEvent.click(screen.getAllByText('Next')[0])
  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 26-26 of 26',
    ),
  ).toBeVisible()
  expect(textService.query.mock.calls[1][0]).toEqual({
    transliteration: 'a+b',
    limit: 25,
    offset: 25,
  })
  expect(screen.getByTestId('route')).toHaveTextContent(
    'paginationIndex=4&limit=100&corpusPaginationIndex=1&corpusLimit=25#corpus',
  )

  await userEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 1-25 of 26',
    ),
  ).toBeVisible()
})

it('replaces an out-of-range direct URL with the last real page', async () => {
  textService.query.mockImplementation(
    async (query): Promise<CorpusQueryResult> => ({
      items: query.offset === 25 ? items(1, 26) : [],
      totalChapters: 26,
      matchCountTotal: 30,
      hasNextPage: false,
    }),
  )
  renderSearch(
    '/library/search/?transliteration=a%2Bb&paginationIndex=4&limit=100&corpusPaginationIndex=9&corpusLimit=25#corpus',
  )

  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 26-26 of 26',
    ),
  ).toBeVisible()
  expect(textService.query.mock.calls.map(([query]) => query.offset)).toEqual([
    225, 25,
  ])
  expect(screen.getByTestId('route')).toHaveTextContent(
    'paginationIndex=4&limit=100&corpusPaginationIndex=1&corpusLimit=25#corpus',
  )
  expect(screen.queryByText('No chapters on this page')).not.toBeInTheDocument()
})

it('resets only the Corpus page when its page size changes', async () => {
  textService.query.mockImplementation(
    async (query): Promise<CorpusQueryResult> => ({
      items: query.limit === 50 ? items(26) : items(1, 26),
      totalChapters: 26,
      matchCountTotal: 30,
      hasNextPage: false,
    }),
  )
  renderSearch(
    '/library/search/?transliteration=a%2Bb&paginationIndex=4&limit=100&corpusPaginationIndex=1&corpusLimit=25#corpus',
  )
  await screen.findByText(
    'Found 30 matching line variants in 26 chapters. Showing chapters 26-26 of 26',
  )

  await userEvent.selectOptions(
    screen.getAllByLabelText('Results per page')[0],
    '50',
  )
  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 1-26 of 26',
    ),
  ).toBeVisible()
  expect(textService.query.mock.calls.at(-1)?.[0]).toEqual({
    transliteration: 'a+b',
    limit: 50,
    offset: 0,
  })
  expect(screen.getByTestId('route')).toHaveTextContent(
    'paginationIndex=4&limit=100&corpusPaginationIndex=0&corpusLimit=50#corpus',
  )
})

it('shows exact zero chapters without result cards or detail requests', async () => {
  textService.query.mockResolvedValue({
    items: [],
    totalChapters: 0,
    matchCountTotal: 0,
    hasNextPage: false,
  })
  renderSearch('/library/search/?transliteration=a%2Bb#corpus')

  expect(
    await screen.findByText('Found 0 matching line variants in 0 chapters'),
  ).toBeVisible()
  expect(textService.query.mock.calls[0][0]).toEqual({
    transliteration: 'a+b',
    limit: 50,
    offset: 0,
  })
  expect(textService.findChapterDisplay).not.toHaveBeenCalled()
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
})

it('keeps Previous available on an empty page with unknown totals', async () => {
  textService.query.mockResolvedValue({
    items: [],
    matchCountTotal: null,
    hasNextPage: false,
  })
  renderSearch(
    '/library/search/?transliteration=a%2Bb&corpusPaginationIndex=2&corpusLimit=25#corpus',
  )

  expect(await screen.findByText('No chapters on this page')).toBeVisible()
  expect(screen.getAllByText('Previous')[0]).toHaveAttribute(
    'href',
    expect.stringContaining('corpusPaginationIndex=1&corpusLimit=25#corpus'),
  )
  expect(screen.queryByText('First')).not.toBeInTheDocument()
})

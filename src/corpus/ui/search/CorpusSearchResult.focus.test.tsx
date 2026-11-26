import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import { CorpusSearchResult } from 'corpus/ui/search/CorpusSearchResult'
import { corpusQueryItemFactory } from 'test-support/query-item-factory'

jest.mock('corpus/application/TextService')
jest.mock('common/hooks/useNearViewport', () => ({
  __esModule: true,
  default: () => ({ containerRef: () => undefined, isNearViewport: false }),
}))

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const firstPageSummary = 'Found 26 chapters. Showing chapters 1-25 of 26'
const secondPageSummary = 'Found 26 chapters. Showing chapters 26-26 of 26'

const searchUrl = (query: string, pageIndex: number): string =>
  `/library/search/?transliteration=${query}&corpusPaginationIndex=${pageIndex}&corpusLimit=25#corpus`

function SearchFromUrl(): JSX.Element {
  const { search } = useLocation()
  const navigate = useNavigate()
  const transliteration = new URLSearchParams(search).get('transliteration')
  return (
    <>
      <CorpusSearchResult
        textService={textService}
        corpusQuery={{ transliteration: transliteration ?? '' }}
      />
      <button type="button" onClick={() => navigate(searchUrl('b', 0))}>
        New search
      </button>
    </>
  )
}

function renderPage(pageIndex: number): void {
  render(
    <MemoryRouter initialEntries={[searchUrl('a', pageIndex)]}>
      <SearchFromUrl />
    </MemoryRouter>,
  )
}

const renderFirstPage = (): void => renderPage(0)

beforeEach(() => {
  jest.clearAllMocks()
  textService.query.mockImplementation(async (query) => ({
    items: corpusQueryItemFactory.buildList(query.offset === 25 ? 1 : 26, {
      lines: [0],
      variants: [0],
      matchCount: 1,
    }),
    totalChapters: 26,
    matchCountTotal: null,
  }))
})

it('does not take focus on the initial load', async () => {
  renderFirstPage()

  expect(await screen.findByText(firstPageSummary)).not.toHaveFocus()
})

it('moves focus to the summary after a page change', async () => {
  renderFirstPage()
  await screen.findByText(firstPageSummary)

  await userEvent.click(screen.getAllByText('Next')[0])

  expect(await screen.findByText(secondPageSummary)).toHaveFocus()
})

it('does not take focus when an out-of-range deep link is corrected', async () => {
  renderPage(9)

  expect(await screen.findByText(secondPageSummary)).not.toHaveFocus()
})

it('does not take focus when a new search resets the page', async () => {
  renderPage(1)
  await screen.findByText(secondPageSummary)

  await userEvent.click(screen.getByRole('button', { name: 'New search' }))

  expect(await screen.findByText(firstPageSummary)).not.toHaveFocus()
})

it('offers Retry when a page fails to load', async () => {
  textService.query.mockRejectedValueOnce(new Error('Failed'))
  renderFirstPage()

  await userEvent.click(await screen.findByRole('button', { name: /retry/i }))

  expect(await screen.findByText(firstPageSummary)).toBeVisible()
})

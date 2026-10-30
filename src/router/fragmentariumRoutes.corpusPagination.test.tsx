import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { Switch } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import { getServices } from 'test-support/AppDriver'
import LocationDisplay from 'test-support/LocationDisplay'
import { corpusQueryItemFactory } from 'test-support/query-item-factory'
import { FragmentQuery } from 'query/FragmentQuery'
import {
  CorpusQueryItem,
  CorpusQueryResult,
  QueryResult,
} from 'query/QueryResult'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

jest.mock('common/hooks/useNearViewport', () => ({
  __esModule: true,
  default: () => ({ containerRef: () => undefined, isNearViewport: false }),
}))

function BrowserBack(): JSX.Element {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(-1)}>
      Back
    </button>
  )
}

function corpusItems(count: number, start: number): CorpusQueryItem[] {
  return Array.from({ length: count }, (_unused, index) =>
    corpusQueryItemFactory.build({
      name: `Chapter ${start + index}`,
      lines: [0],
      variants: [0],
      matchCount: 1,
    }),
  )
}

it('keeps bounded Corpus pagination and independent Library state on the shared route', async () => {
  const services = getServices()
  const libraryQuery = jest
    .spyOn(services.fragmentService, 'query')
    .mockImplementation(
      async (query: FragmentQuery): Promise<QueryResult> => ({
        items:
          query.offset === 100
            ? [{ museumNumber: 'K.101', matchingLines: [], matchCount: 0 }]
            : [],
        totalDocuments: 101,
        matchCountTotal: null,
        hasNextPage: false,
      }),
    )
  jest.spyOn(services.fragmentService, 'fetchPeriods').mockResolvedValue([])
  jest.spyOn(services.fragmentService, 'fetchGenres').mockResolvedValue([])
  jest.spyOn(services.fragmentService, 'fetchProvenances').mockResolvedValue([])
  jest
    .spyOn(services.dossiersService, 'fetchFilteredDossiers')
    .mockResolvedValue([])
  jest.spyOn(services.wordService, 'findAll').mockResolvedValue([])
  const corpusQuery = jest
    .spyOn(services.textService, 'query')
    .mockImplementation(
      async (query): Promise<CorpusQueryResult> => ({
        items: query.offset === 25 ? corpusItems(1, 26) : corpusItems(25, 1),
        totalChapters: 26,
        matchCountTotal: 30,
        isMatchCountTotalExact: true,
        hasNextPage: query.offset === 0,
      }),
    )
  const initialEntry =
    '/library/search/?transliteration=a%2Bb&paginationIndex=1&limit=100&corpusPaginationIndex=0&corpusLimit=25#corpus'

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SessionContext.Provider value={new MemorySession(['read:fragments'])}>
        <LocationDisplay />
        <BrowserBack />
        <Switch>{FragmentariumRoutes({ ...services, sitemap: false })}</Switch>
      </SessionContext.Provider>
    </MemoryRouter>,
  )

  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 1-25 of 26',
    ),
  ).toBeVisible()
  expect(
    screen.getByRole('tab', { name: 'Corpus', selected: true }),
  ).toBeVisible()
  expect(corpusQuery.mock.calls[0][0]).toEqual({
    transliteration: 'a+b',
    limit: 25,
    offset: 0,
  })
  expect(libraryQuery.mock.calls[0][0]).toEqual({
    transliteration: 'a+b',
    limit: 101,
    offset: 100,
    count: 'exact',
  })
  const nextPage = screen
    .getAllByRole('link', { name: 'Next' })
    .find((link) =>
      link.getAttribute('href')?.includes('corpusPaginationIndex=1'),
    )
  expect(nextPage).toBeDefined()
  await userEvent.click(nextPage as HTMLElement)

  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 26-26 of 26',
    ),
  ).toBeVisible()
  expect(corpusQuery.mock.calls[1][0]).toEqual({
    transliteration: 'a+b',
    limit: 25,
    offset: 25,
  })
  expect(screen.getByTestId('location')).toHaveTextContent(
    'transliteration=a%2Bb&paginationIndex=1&limit=100&corpusPaginationIndex=1&corpusLimit=25#corpus',
  )
  expect(
    screen.getByRole('tab', { name: 'Corpus', selected: true }),
  ).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(
    await screen.findByText(
      'Found 30 matching line variants in 26 chapters. Showing chapters 1-25 of 26',
    ),
  ).toBeVisible()
  expect(corpusQuery.mock.calls[2][0]).toEqual({
    transliteration: 'a+b',
    limit: 25,
    offset: 0,
  })
  expect(screen.getByTestId('location')).toHaveTextContent(
    'transliteration=a%2Bb&paginationIndex=1&limit=100&corpusPaginationIndex=0&corpusLimit=25#corpus',
  )
  expect(
    screen.getByRole('tab', { name: 'Corpus', selected: true }),
  ).toBeVisible()
})

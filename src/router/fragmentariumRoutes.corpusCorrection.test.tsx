import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Switch } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import { getServices } from 'test-support/AppDriver'
import LocationDisplay from 'test-support/LocationDisplay'
import { corpusQueryItemFactory } from 'test-support/query-item-factory'
import { CorpusQueryResult } from 'query/QueryResult'

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

it.each([
  { tab: 'Library', hash: '#library', page: 99, offsets: [2475, 25] },
  { tab: 'Corpus', hash: '#corpus', page: 99, offsets: [2475, 25] },
  { tab: 'Library', hash: '#library', page: 1, offsets: [25] },
])(
  'keeps $tab active while validating Corpus page $page on the shared route',
  async ({ tab, hash, page, offsets }) => {
    const services = getServices()
    jest.spyOn(services.fragmentService, 'query').mockResolvedValue({
      items: [],
      matchCountTotal: 0,
      hasNextPage: false,
    })
    jest.spyOn(services.fragmentService, 'fetchPeriods').mockResolvedValue([])
    jest.spyOn(services.fragmentService, 'fetchGenres').mockResolvedValue([])
    jest
      .spyOn(services.fragmentService, 'fetchProvenances')
      .mockResolvedValue([])
    jest
      .spyOn(services.dossiersService, 'fetchFilteredDossiers')
      .mockResolvedValue([])
    jest.spyOn(services.wordService, 'findAll').mockResolvedValue([])
    const corpusQuery = jest
      .spyOn(services.textService, 'query')
      .mockImplementation(
        async (query): Promise<CorpusQueryResult> => ({
          items:
            query.offset === 25
              ? [corpusQueryItemFactory.build({ lines: [0], variants: [0] })]
              : [],
          totalChapters: 26,
          matchCountTotal: 1,
          hasNextPage: false,
        }),
      )
    render(
      <MemoryRouter
        initialEntries={[
          `/library/search/?transliteration=kur&paginationIndex=0&limit=100&corpusPaginationIndex=${page}&corpusLimit=25${hash}`,
        ]}
      >
        <SessionContext.Provider value={new MemorySession(['read:fragments'])}>
          <LocationDisplay />
          <Switch>
            {FragmentariumRoutes({ ...services, sitemap: false })}
          </Switch>
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(
        'Found 1 matching line variant in 26 chapters. Showing chapters 26-26 of 26',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: tab, selected: true })).toBeVisible()
    expect(screen.getByTestId('location')).toHaveTextContent(
      `transliteration=kur&paginationIndex=0&limit=100&corpusPaginationIndex=1&corpusLimit=25${hash}`,
    )
    expect(corpusQuery.mock.calls.map(([query]) => query.offset)).toEqual(
      offsets,
    )
  },
)

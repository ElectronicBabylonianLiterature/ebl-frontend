import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { FragmentQuery } from 'query/FragmentQuery'
import { renderLibrarySearch } from 'router/searchRoutes.testSupport'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

jest.mock(
  'fragmentarium/ui/search/FragmentariumSearchResultComponents',
  () => ({
    FragmentLines: ({ queryItem }: { queryItem: QueryItem }) => (
      <div>{queryItem.museumNumber}</div>
    ),
  }),
)

function buildQueryResult(query: FragmentQuery): QueryResult {
  const first = (query.offset ?? 0) + 1
  return {
    items: [
      {
        museumNumber: `K.${first}`,
        matchingLines: [],
        matchCount: 0,
      },
    ],
    matchCountTotal: null,
    hasNextPage: true,
  }
}

function renderRoutes(initialEntry: string): FragmentService {
  return renderLibrarySearch(initialEntry, buildQueryResult)
}

describe('FragmentariumRoutes library search pagination', () => {
  it('sends the first explicit-limit page by default', async () => {
    const view = renderRoutes('/library/search/?number=000123')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      number: '000123',
      limit: 51,
      offset: 0,
      count: 'page',
    })
  })

  it('direct navigation to paginationIndex=2 sends offset 100 without normalizing search values', async () => {
    const view = renderRoutes(
      '/library/search/?number=000123&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries&paginationIndex=2',
    )

    expect(await screen.findByText('K.101')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      number: '000123',
      genre: 'CANONICAL:Technical:Astronomy:Astronomical Diaries',
      limit: 51,
      offset: 100,
      count: 'page',
    })
  })

  it.each(['abc', '-5', '1.5'])(
    'treats invalid paginationIndex=%s as page zero',
    async (paginationIndex) => {
      const view = renderRoutes(
        `/library/search/?number=K.1&paginationIndex=${paginationIndex}`,
      )

      expect(await screen.findByText('K.1')).toBeInTheDocument()
      expect(view.query).toHaveBeenCalledWith({
        number: 'K.1',
        limit: 51,
        offset: 0,
        count: 'page',
      })
    },
  )

  it('requests exact counts for transliteration line searches', async () => {
    const view = renderRoutes('/library/search/?transliteration=kur')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      transliteration: 'kur',
      limit: 51,
      offset: 0,
      count: 'exact',
    })
  })

  it('requests exact counts for lemma line searches', async () => {
    const view = renderRoutes('/library/search/?lemmas=kur')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      lemmas: 'kur',
      limit: 51,
      offset: 0,
      count: 'exact',
    })
  })

  it('overfetches line searches by one item while offsetting by the visible page size', async () => {
    const view = renderRoutes(
      '/library/search/?transliteration=kur&limit=25&paginationIndex=2',
    )

    expect(await screen.findByText('K.51')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      transliteration: 'kur',
      limit: 26,
      offset: 50,
      count: 'exact',
    })
  })

  it('uses a validated URL result size without fetching every result', async () => {
    const view = renderRoutes(
      '/library/search/?number=000123&limit=100&paginationIndex=1',
    )

    expect(await screen.findByText('K.101')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      number: '000123',
      limit: 101,
      offset: 100,
      count: 'page',
    })
  })

  it('uses URL page changes to request the next server page', async () => {
    const view = renderRoutes(
      '/library/search/?number=000123&paginationIndex=1',
    )

    expect(await screen.findByText('K.51')).toBeInTheDocument()
    expect(view.query).toHaveBeenLastCalledWith({
      number: '000123',
      limit: 51,
      offset: 50,
      count: 'page',
    })

    await userEvent.click(screen.getAllByText('Next')[0])

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        'number=000123&paginationIndex=2',
      )
    })
    expect(await screen.findByText('K.101')).toBeInTheDocument()
    expect(view.query).toHaveBeenLastCalledWith({
      number: '000123',
      limit: 51,
      offset: 100,
      count: 'page',
    })
  })
})

import React from 'react'
import { screen } from '@testing-library/react'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { renderProjectSearch } from 'router/searchRoutes.testSupport'

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

function buildResult(query: FragmentQuery): QueryResult {
  const first = (query.offset ?? 0) + 1
  return {
    items: [{ museumNumber: `K.${first}`, matchingLines: [], matchCount: 0 }],
    matchCountTotal: null,
    hasNextPage: false,
  }
}

describe('project home with search criteria', () => {
  it('redirects a bookmarked project home search to the search route', async () => {
    const view = renderProjectSearch('/projects/CAIC?number=K.1', buildResult)

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      project: 'CAIC',
      number: 'K.1',
      limit: 51,
      offset: 0,
      count: 'page',
    })
  })

  it('preserves every criterion and the pagination index across the redirect', async () => {
    const view = renderProjectSearch(
      '/projects/CAIC?number=K.1&transliteration=ana&paginationIndex=1',
      buildResult,
    )

    expect(await screen.findByText('K.51')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      project: 'CAIC',
      number: 'K.1',
      transliteration: 'ana',
      limit: 51,
      offset: 50,
      count: 'exact',
    })
    expect(screen.getByTestId('location')).toHaveTextContent(
      'paginationIndex=1',
    )
  })

  it('renders the project home page when there are no search criteria', async () => {
    const view = renderProjectSearch('/projects/CAIC', buildResult)

    expect(
      await screen.findByRole('heading', { name: /Search in CAIC/i }),
    ).toBeVisible()
    expect(view.query).not.toHaveBeenCalled()
  })

  it('renders the project home page for pagination params alone', async () => {
    const view = renderProjectSearch(
      '/projects/CAIC?paginationIndex=2',
      buildResult,
    )

    expect(
      await screen.findByRole('heading', { name: /Search in CAIC/i }),
    ).toBeVisible()
    expect(view.query).not.toHaveBeenCalled()
  })
})

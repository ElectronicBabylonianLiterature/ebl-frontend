import React from 'react'
import _ from 'lodash'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useNavigate } from 'react-router-dom'
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

const startLocation = '/library/search/?number=K.1'
const outOfRangeLocation = '/library/search/?number=K.1&paginationIndex=99'
const lastPageLocation = '/library/search/?number=K.1&paginationIndex=4'

function exactly(location: string): RegExp {
  return new RegExp(`^${_.escapeRegExp(location)}$`)
}

function buildQueryResult(query: FragmentQuery): QueryResult {
  const offset = query.offset ?? 0
  return {
    items:
      offset > 200
        ? []
        : [
            {
              museumNumber: `K.${offset + 1}`,
              matchingLines: [],
              matchCount: 0,
            },
          ],
    matchCountTotal: null,
    totalDocuments: 237,
    hasNextPage: false,
  }
}

function HistoryControls(): JSX.Element {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate(outOfRangeLocation)}>Visit</button>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  )
}

describe('FragmentariumRoutes out-of-range pagination history', () => {
  it('replaces an out-of-range URL so Back returns to the previous page', async () => {
    const query = renderLibrarySearch(
      startLocation,
      buildQueryResult,
      <HistoryControls />,
    ).query

    expect(await screen.findByText('K.1')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Visit'))
    expect(await screen.findByText('K.201')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(
      exactly(lastPageLocation),
    )

    await userEvent.click(screen.getByText('Back'))
    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(
      exactly(startLocation),
    )
    expect(screen.queryByText('K.201')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Forward'))
    expect(await screen.findByText('K.201')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(
      exactly(lastPageLocation),
    )
    expect(query).toHaveBeenCalledTimes(5)
    expect(query).toHaveBeenNthCalledWith(4, {
      number: 'K.1',
      limit: 51,
      offset: 0,
      count: 'exact',
    })
  })
})

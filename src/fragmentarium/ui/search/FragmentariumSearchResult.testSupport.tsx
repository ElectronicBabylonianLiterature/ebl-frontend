import React from 'react'
import PropTypes from 'prop-types'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { FragmentSearchCriteria } from 'query/FragmentQuery'
import { SearchPagination } from 'fragmentarium/ui/search/pagination'

function MockFragmentLines({ queryItem }: { queryItem: QueryItem }) {
  return <div>{queryItem.museumNumber}</div>
}

MockFragmentLines.propTypes = {
  queryItem: PropTypes.shape({
    museumNumber: PropTypes.string.isRequired,
  }).isRequired,
}

jest.mock(
  'fragmentarium/ui/search/FragmentariumSearchResultComponents',
  () => ({
    FragmentLines: MockFragmentLines,
  }),
)

type RenderSearchResultOptions = {
  search?: string
  queryResult?: QueryResult
  fragmentQuery?: FragmentSearchCriteria
  pagination?: SearchPagination
  leadingContent?: React.ReactNode
  fragmentService?: jest.Mocked<FragmentService>
}

const defaultFragmentQuery: FragmentSearchCriteria = { number: 'K.1' }
const defaultPagination: SearchPagination = { pageIndex: 0, pageSize: 50 }

export function buildQueryResult({
  items = 50,
  hasNextPage = true,
  matchCountTotal = null,
}: {
  items?: number
  hasNextPage?: boolean | null
  matchCountTotal?: number | null
} = {}): QueryResult {
  return {
    items: Array.from({ length: items }, (_, index) => ({
      museumNumber: `K.${index + 1}`,
      matchingLines: [],
      matchCount: 0,
    })),
    matchCountTotal,
    hasNextPage,
  }
}

export function renderSearchResult({
  search = '',
  queryResult = buildQueryResult(),
  fragmentQuery = defaultFragmentQuery,
  pagination = defaultPagination,
  leadingContent,
  fragmentService: providedFragmentService,
}: RenderSearchResultOptions = {}) {
  const fragmentService =
    providedFragmentService ??
    ({
      query: jest.fn().mockResolvedValue(queryResult),
    } as unknown as jest.Mocked<FragmentService>)
  let renderResult: ReturnType<typeof render> | undefined

  function renderView(nextOptions: Partial<RenderSearchResultOptions> = {}) {
    const nextSearch = nextOptions.search ?? search
    const nextFragmentQuery = nextOptions.fragmentQuery ?? fragmentQuery
    const nextPagination = nextOptions.pagination ?? pagination
    const nextLeadingContent = nextOptions.leadingContent ?? leadingContent
    const element = (
      <MemoryRouter initialEntries={[`/library/search/${nextSearch}`]}>
        {nextLeadingContent}
        <SearchResult
          fragmentService={fragmentService}
          dossiersService={{} as DossiersService}
          fragmentQuery={nextFragmentQuery}
          pagination={nextPagination}
        />
      </MemoryRouter>
    )
    if (renderResult) {
      renderResult.rerender(element)
    } else {
      renderResult = render(element)
    }
  }

  renderView()

  return Object.assign(renderResult as ReturnType<typeof render>, {
    fragmentService,
    query: fragmentService.query,
    renderView,
  })
}

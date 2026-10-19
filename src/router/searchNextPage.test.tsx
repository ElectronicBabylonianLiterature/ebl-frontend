import React from 'react'
import { screen, within } from '@testing-library/react'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryItem, QueryResult } from 'query/QueryResult'
import {
  renderLibrarySearch,
  renderProjectSearch,
} from 'router/searchRoutes.testSupport'

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

const PAGE_SIZE = 50

function items(query: FragmentQuery, count: number): readonly QueryItem[] {
  const first = (query.offset ?? 0) + 1
  return Array.from({ length: count }, (unused, index) => ({
    museumNumber: `K.${first + index}`,
    matchingLines: [],
    matchCount: 0,
  }))
}

function buildResult(
  itemCount: number,
  hasNextPage: boolean | null | undefined,
): (query: FragmentQuery) => QueryResult {
  return (query) => ({
    items: items(query, itemCount),
    matchCountTotal: null,
    ...(hasNextPage === undefined ? {} : { hasNextPage }),
  })
}

const routes: readonly [string, string][] = [
  ['/library/search/?number=000123', 'library'],
  ['/projects/CAIC/search', 'project'],
  ['/projects/aluGeneva/search', 'project'],
  ['/projects/AMPS/search', 'project'],
  ['/projects/RECC/search', 'project'],
]

function renderRoute(
  entry: string,
  kind: string,
  build: (query: FragmentQuery) => QueryResult,
): void {
  if (kind === 'library') {
    renderLibrarySearch(entry, build)
  } else {
    renderProjectSearch(entry, build)
  }
}

async function paginationControls(): Promise<readonly HTMLElement[]> {
  const nav = await screen.findByRole('navigation', {
    name: 'Search results pagination, top',
  })
  return within(nav).getAllByRole('listitem')
}

async function nextButton(): Promise<HTMLElement> {
  return (await paginationControls())[2]
}

async function previousButton(): Promise<HTMLElement> {
  return (await paginationControls())[0]
}

function pageEntry(entry: string, pageIndex: number): string {
  return `${entry}${entry.includes('?') ? '&' : '?'}paginationIndex=${pageIndex}`
}

describe.each(routes)('next page on %s', (entry, kind) => {
  it('enables Next when the backend reports another page', async () => {
    renderRoute(entry, kind, buildResult(PAGE_SIZE, true))

    expect(await nextButton()).not.toHaveClass('disabled')
  })

  it('disables Next when the backend reports the last page', async () => {
    renderRoute(entry, kind, buildResult(PAGE_SIZE, false))

    expect(await nextButton()).toHaveClass('disabled')
  })

  it.each([undefined, null])(
    'still detects the next page from the overfetched item when hasNextPage is %s',
    async (hasNextPage) => {
      renderRoute(entry, kind, buildResult(PAGE_SIZE + 1, hasNextPage))

      expect(await nextButton()).not.toHaveClass('disabled')
    },
  )

  it.each([undefined, null])(
    'disables Next on a short final page when hasNextPage is %s',
    async (hasNextPage) => {
      renderRoute(entry, kind, buildResult(PAGE_SIZE, hasNextPage))

      expect(await nextButton()).toHaveClass('disabled')
    },
  )

  it('renders only the visible page size when the backend overfetches', async () => {
    renderRoute(entry, kind, buildResult(PAGE_SIZE + 1, true))

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getByText(/Showing documents 1-50/)).toBeInTheDocument()
    expect(screen.queryByText('K.51')).not.toBeInTheDocument()
  })

  it('keeps Previous and Next usable on a middle page', async () => {
    renderRoute(pageEntry(entry, 2), kind, buildResult(PAGE_SIZE + 1, true))

    expect(await screen.findByText('K.101')).toBeInTheDocument()
    expect(await nextButton()).not.toHaveClass('disabled')
    expect(await previousButton()).not.toHaveClass('disabled')
  })

  it('keeps Previous usable on an empty last page', async () => {
    renderRoute(pageEntry(entry, 3), kind, buildResult(0, false))

    expect(
      await screen.findByText('No results on this page'),
    ).toBeInTheDocument()
    expect(await nextButton()).toHaveClass('disabled')
    expect(await previousButton()).not.toHaveClass('disabled')
  })
})

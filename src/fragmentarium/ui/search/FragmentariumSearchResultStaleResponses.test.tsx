import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import LocationDisplay from 'test-support/LocationDisplay'
import { SearchResultFragmentService } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import { QueryResult } from 'query/QueryResult'
import { renderSearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult.testSupport'

describe('FragmentariumSearchResult stale responses', () => {
  it('does not correct the next query using a stale earlier total', async () => {
    const fragmentService: jest.Mocked<SearchResultFragmentService> = {
      find: jest.fn(),
      findThumbnail: jest.fn(),
      query: jest
        .fn()
        .mockResolvedValueOnce({
          items: [{ museumNumber: 'K.old', matchingLines: [], matchCount: 0 }],
          matchCountTotal: null,
          totalDocuments: 1,
        })
        .mockResolvedValueOnce({
          items: [{ museumNumber: 'K.new', matchingLines: [], matchCount: 0 }],
          matchCountTotal: null,
          totalDocuments: 237,
        }),
    }
    const view = renderSearchResult({
      fragmentService,
      leadingContent: <LocationDisplay />,
    })
    expect(await screen.findByText('K.old')).toBeInTheDocument()

    view.renderView({
      fragmentQuery: { number: 'K.2' },
      pagination: { pageIndex: 4, pageSize: 50 },
    })

    expect(await screen.findByText('K.new')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('location')).not.toHaveTextContent(
      'paginationIndex=0',
    )
  })

  it('ignores stale responses when the effective page query changes', async () => {
    let resolveFirst: (value: QueryResult) => void = () => undefined
    let resolveSecond: (value: QueryResult) => void = () => undefined
    const fragmentService: jest.Mocked<SearchResultFragmentService> = {
      find: jest.fn(),
      findThumbnail: jest.fn(),
      query: jest
        .fn()
        .mockReturnValueOnce(
          new Promise<QueryResult>((resolve) => {
            resolveFirst = resolve
          }),
        )
        .mockReturnValueOnce(
          new Promise<QueryResult>((resolve) => {
            resolveSecond = resolve
          }),
        ),
    }

    const view = renderSearchResult({
      search: '?number=K.1',
      fragmentService,
    })

    view.renderView({
      pagination: { pageIndex: 1, pageSize: 50 },
    })

    resolveSecond({
      items: [{ museumNumber: 'K.new', matchingLines: [], matchCount: 0 }],
      matchCountTotal: null,
      hasNextPage: false,
    })
    expect(await screen.findByText('K.new')).toBeInTheDocument()

    resolveFirst({
      items: [{ museumNumber: 'K.old', matchingLines: [], matchCount: 0 }],
      matchCountTotal: null,
      hasNextPage: false,
    })

    await waitFor(() => {
      expect(screen.queryByText('K.old')).not.toBeInTheDocument()
    })
  })
})

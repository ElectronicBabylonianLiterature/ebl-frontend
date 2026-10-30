import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockHistoryPush } from 'fragmentarium/ui/search/PaginationItems.testSupport'
import PaginationItems from 'fragmentarium/ui/search/PaginationItems'

it('keeps Corpus page keys and tab hash separate from Library state', async () => {
  render(
    <MemoryRouter
      initialEntries={[
        '/library/search/?transliteration=a%2Bb&paginationIndex=2&limit=100&corpusPaginationIndex=0&corpusLimit=25#library',
      ]}
    >
      <PaginationItems
        paginationURLParam="corpusPaginationIndex"
        pageSizeURLParam="corpusLimit"
        hash="#corpus"
        activePage={0}
        pageSize={25}
        hasNextPage={true}
        lastPageIndex={4}
        position="top"
      />
    </MemoryRouter>,
  )

  expect(screen.getByText('Next')).toHaveAttribute(
    'href',
    '/library/search/?transliteration=a%2Bb&paginationIndex=2&limit=100&corpusPaginationIndex=1&corpusLimit=25#corpus',
  )
  await userEvent.click(screen.getByText('Next'))
  expect(mockHistoryPush).toHaveBeenLastCalledWith({
    pathname: '/library/search/',
    search:
      'transliteration=a%2Bb&paginationIndex=2&limit=100&corpusPaginationIndex=1&corpusLimit=25',
    hash: '#corpus',
  })

  await userEvent.selectOptions(screen.getByLabelText('Results per page'), '50')
  expect(mockHistoryPush).toHaveBeenLastCalledWith({
    pathname: '/library/search/',
    search:
      'transliteration=a%2Bb&paginationIndex=2&limit=100&corpusPaginationIndex=0&corpusLimit=50',
    hash: '#corpus',
  })
})

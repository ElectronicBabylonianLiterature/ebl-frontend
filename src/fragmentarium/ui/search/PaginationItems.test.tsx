import React, { useState } from 'react'
import { Router } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, MemoryHistory } from 'history'
import PaginationItems from 'fragmentarium/ui/search/PaginationItems'

let history: MemoryHistory

const totalPages = 100

function PaginationItemsWrapper({ startPage }: { startPage: number }) {
  const [activePage, setActivePage] = useState(startPage)
  return (
    <PaginationItems
      activePage={activePage}
      setActivePage={setActivePage}
      totalPages={totalPages}
    />
  )
}

function renderPaginationItems(startPage = 0) {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  return render(
    <Router history={history}>
      <PaginationItemsWrapper startPage={startPage} />
    </Router>
  )
}

describe('Click through Pagination Component Beginning', () => {
  beforeEach(async () => {
    renderPaginationItems()
    await screen.findByText('1')
  })

  it('Click next Pages', async () => {
    for (const page of [2, 3, 4, 5, 6]) {
      userEvent.click(screen.getByRole('button', { name: page.toString() }))
      await waitFor(() =>
        expect(history.push).toHaveBeenCalledWith({
          search: `paginationIndex=${page - 1}`,
        })
      )
      await waitFor(() =>
        expect(screen.getByRole('button', { name: (page + 3).toString() }))
      )
    }
    await screen.findByRole('button', { name: '9' })
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument()
  })
})
describe('Click through Pagination Component End', () => {
  beforeEach(async () => {
    renderPaginationItems(95)
    await screen.findByText('95')
  })
  it('Click next Pages', async () => {
    for (const page of [97, 98, 99, 100]) {
      userEvent.click(screen.getByRole('button', { name: page.toString() }))
      await waitFor(() =>
        expect(history.push).toHaveBeenCalledWith({
          search: `paginationIndex=${page - 1}`,
        })
      )
      await waitFor(() =>
        expect(
          screen.getByRole('button', {
            name: Math.min(page + 3, 101).toString(),
          })
        )
      )
    }
    expect(screen.queryByRole('button', { name: '95' })).not.toBeInTheDocument()
  })
})

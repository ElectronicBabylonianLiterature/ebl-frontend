import React, { useState } from 'react'
import { Router } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, MemoryHistory } from 'history'
import PaginationItems from 'fragmentarium/ui/search/PaginationItems'

let history: MemoryHistory
let totalPages = 100

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
    /*First Pagination Item with Number '1' is active but has not 'button' role
      unactive Pagination Items have role button
     */
    await screen.findByText('1')
    await screen.findByRole('button', { name: '2' })
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
describe('Total Pages less than Minimum Pagination Elements', () => {
  it('Render Pages but no ellipsis', () => {
    totalPages = 4
    renderPaginationItems(0)
    for (const page of [2, 3, 4]) {
      expect(
        screen.queryByRole('button', { name: page.toString() })
      ).toBeInTheDocument()
    }
    expect(screen.queryByText('…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()
  })
})

import React, { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaginationItems from 'fragmentarium/ui/search/PaginationItems'
import _ from 'lodash'

function PaginationItemsWrapper({
  startPage,
  totalPages,
}: {
  startPage: number
  totalPages: number
}) {
  const [activePage, setActivePage] = useState(startPage)
  return (
    <PaginationItems
      paginationURLParam={'paginationIndex'}
      activePage={activePage}
      setActivePage={setActivePage}
      lastPage={totalPages}
    />
  )
}

function renderPaginationItems(startPage = 0, totalPages: number) {
  return render(
    <MemoryRouter>
      <PaginationItemsWrapper startPage={startPage} totalPages={totalPages} />
    </MemoryRouter>,
  )
}
function expectPaginationElementControlToBeVisible(page: number) {
  expect(screen.getByRole('button', { name: page.toString() })).toBeVisible()
}
function expectPaginationElementControlsToBeVisible(
  start: number,
  end: number,
) {
  for (const page of _.range(start, end + 1, 1)) {
    expectPaginationElementControlToBeVisible(page)
  }
}

describe('Click through Pagination Component Beginning', () => {
  it('1,2,3,4,...,100', async () => {
    renderPaginationItems(0, 99)
    /*First Pagination Item with Number '1' is active but has not 'button' role
      unactive Pagination Items have role button */
    await screen.findByText('1')
    expectPaginationElementControlsToBeVisible(2, 4)
    expect(screen.getByText('…')).toBeInTheDocument()
    expectPaginationElementControlToBeVisible(100)
    expect(
      screen.queryByRole('button', { name: '101' }),
    ).not.toBeInTheDocument()
  })
  it('1,2,3,4,5', async () => {
    renderPaginationItems(0, 4)
    await screen.findByText('1')
    expectPaginationElementControlsToBeVisible(2, 5)
    expect(screen.queryByText('…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '6' })).not.toBeInTheDocument()
  })
  it('1,2,3,4,5', async () => {
    renderPaginationItems(1, 4)
    await screen.findByText('2')
    expectPaginationElementControlsToBeVisible(3, 5)
    expect(screen.queryByText('…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '6' })).not.toBeInTheDocument()
  })
  it('1,2,3,4,...,9', async () => {
    renderPaginationItems(0, 8)
    await screen.findByText('1')
    expectPaginationElementControlsToBeVisible(2, 4)
    expect(screen.getByText('…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()
    expectPaginationElementControlToBeVisible(9)
    expect(screen.queryByRole('button', { name: '10' })).not.toBeInTheDocument()
  })
  it('1,...,5,6,7,8,9', async () => {
    renderPaginationItems(7, 8)
    await screen.findByText('8')
    expectPaginationElementControlsToBeVisible(5, 7)
    expectPaginationElementControlToBeVisible(9)
    expect(screen.getByText('…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '10' })).not.toBeInTheDocument()
  })
  it('1,...,9,10,11,12,13,14,15,16', async () => {
    renderPaginationItems(11, 15)
    await screen.findByText('12')
    expectPaginationElementControlsToBeVisible(9, 11)
    expectPaginationElementControlsToBeVisible(13, 16)
    expect(screen.getByText('…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '8' })).not.toBeInTheDocument()
  })

  it('1,2,3,4,5,6,7,8,9', async () => {
    renderPaginationItems(4, 8)
    await screen.findByText('5')
    expectPaginationElementControlsToBeVisible(6, 9)
    expectPaginationElementControlsToBeVisible(1, 4)
    expect(screen.queryByText('…')).not.toBeInTheDocument()
  })

  it('Click next Pages', async () => {
    renderPaginationItems(0, 99)
    for (const page of [2, 3, 4, 5, 6, 7]) {
      await userEvent.click(
        screen.getByRole('button', { name: page.toString() }),
      )
      expect(await screen.findByText(page.toString())).toBeInTheDocument()
      // expect(history.push).toHaveBeenCalledWith({
      //   search: `paginationIndex=${page - 1}`,
      // })
      await screen.findByRole('button', { name: (page + 3).toString() })
    }
    await screen.findByRole('button', { name: '9' })
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument()
  })
})

describe('Click through Pagination Component End', () => {
  it('Click next Pages', async () => {
    renderPaginationItems(95, 99)
    await screen.findByText('96')
    for (const page of [97, 98, 99]) {
      await userEvent.click(
        screen.getByRole('button', { name: page.toString() }),
      )
      // expect(history.push).toHaveBeenCalledWith({
      //   search: `paginationIndex=${page - 1}`,
      // })
      expect(await screen.findByText(page.toString())).toBeInTheDocument()
      await screen.findByRole('button', {
        name: Math.min(page + 3, 100).toString(),
      })
    }
    expect(screen.queryByRole('button', { name: '95' })).not.toBeInTheDocument()
  })
})

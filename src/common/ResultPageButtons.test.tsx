import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPageButtons } from './ResultPageButtons'
import { queryItemFactory } from 'test-support/query-item-factory'

const setActive = jest.fn()

async function renderPages(numberOfPages: number, active = 0) {
  const pages = Array.from({ length: numberOfPages }, () =>
    queryItemFactory.buildList(3)
  )
  await act(async () => {
    render(
      <ResultPageButtons pages={pages} active={active} setActive={setActive} />
    )
  })
}

describe('ResultPageButtons for few pages', () => {
  beforeEach(() => renderPages(3))

  it('renders pagination buttons correctly', () => {
    const pagination = screen.getByLabelText('result-pagination')
    expect(pagination).toBeInTheDocument()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByText('3')).toBeVisible()
    expect(screen.queryByText('…')).not.toBeInTheDocument()
  })

  it('triggers setActive when clicking on pagination buttons', () => {
    const paginationItem = screen.getByText('1')
    userEvent.click(paginationItem)

    expect(setActive).toHaveBeenCalledWith(0)
  })
})

describe('ResultPageButtons for many pages', () => {
  beforeEach(() => renderPages(15, 4))

  it('renders pagination buttons correctly', () => {
    const pagination = screen.getByLabelText('result-pagination')
    expect(pagination).toBeInTheDocument()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByText('15')).toBeVisible()
    expect(screen.getByText('…')).toBeVisible()
  })

  it('shows ellipsis when page 7 is active', () => {
    const paginationItem = screen.getByText('7')
    userEvent.click(paginationItem)

    expect(setActive).toHaveBeenCalledWith(6)
    expect(screen.getByText('…')).toBeVisible()
  })
})

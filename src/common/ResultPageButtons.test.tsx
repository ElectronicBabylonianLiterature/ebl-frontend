import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPageButtons } from './ResultPageButtons'
import { QueryItem } from 'query/QueryResult'
import { queryItemFactory } from 'test-support/query-item-factory'

const setActive = jest.fn()
let numberOfPages: number
let pages: QueryItem[][]

describe('ResultPageButtons for few pages', () => {
  beforeEach(async () => {
    numberOfPages = 3
    pages = Array.from({ length: numberOfPages }, () =>
      queryItemFactory.buildList(3)
    )
    await act(async () => {
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />
      )
    })
  })

  it('renders pagination buttons correctly', () => {
    const pagination = screen.getByLabelText('result-pagination')
    expect(pagination).toBeInTheDocument()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByText(`${numberOfPages}`)).toBeVisible()
    expect(screen.queryByText('…')).not.toBeInTheDocument()
  })

  it('triggers setActive when clicking on pagination buttons', () => {
    const paginationItem = screen.getByText('1')
    userEvent.click(paginationItem)

    expect(setActive).toHaveBeenCalledWith(0)
  })
})

describe('ResultPageButtons for many pages', () => {
  beforeEach(async () => {
    numberOfPages = 15
    pages = Array.from({ length: numberOfPages }, () =>
      queryItemFactory.buildList(3)
    )
    await act(async () => {
      render(
        <ResultPageButtons pages={pages} active={3} setActive={setActive} />
      )
    })
  })

  it('renders pagination buttons correctly', () => {
    const pagination = screen.getByLabelText('result-pagination')
    expect(pagination).toBeInTheDocument()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByText(`${numberOfPages}`)).toBeVisible()
    expect(screen.getByText('…')).toBeVisible()
  })

  it('triggers setActive when clicking on pagination buttons', () => {
    const paginationItem = screen.getByText('1')
    userEvent.click(paginationItem)

    expect(setActive).toHaveBeenCalledWith(0)
  })

  it('shows ellipsis when page 7 is active', () => {
    const paginationItem = screen.getByText('7')
    userEvent.click(paginationItem)

    expect(setActive).toHaveBeenCalledWith(6)
    expect(screen.getByText('…')).toBeVisible()
  })
})

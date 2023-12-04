import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPageButtons } from './ResultPageButtons'
import {
  queryItemFactory,
  corpusQueryItemFactory,
} from 'test-support/query-item-factory'

const setActive = jest.fn()

describe('ResultPageButtons', () => {
  const pages = [
    queryItemFactory.buildList(3),
    corpusQueryItemFactory.buildList(3),
  ]

  beforeEach(async () => {
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
    expect(screen.getByText('2')).toBeVisible()
  })

  it('triggers setActive when clicking on pagination buttons', () => {
    const paginationItem = screen.getByText('1')
    userEvent.click(paginationItem)

    expect(setActive).toHaveBeenCalledWith(0)
  })
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockHistoryPush,
  renderPaginationItems,
} from 'fragmentarium/ui/search/PaginationItems.testSupport'

describe('PaginationItems page jump', () => {
  it('jumps directly to a requested page and clears the input afterwards', async () => {
    renderPaginationItems(0, true, '/library/search/?number=K.1', 50, 9)

    const pageJumpInput = screen.getByLabelText('Go to page')
    await userEvent.type(pageJumpInput, '4')
    await userEvent.click(screen.getByText('Go'))

    expect(mockHistoryPush).toHaveBeenLastCalledWith({
      pathname: '/library/search/',
      search: 'number=K.1&paginationIndex=3',
      hash: '',
    })
    expect(pageJumpInput).toHaveValue(null)
  })

  it('ignores invalid and current page jump requests', async () => {
    renderPaginationItems(2, true, '/library/search/?number=K.1', 50, 9)

    await userEvent.type(screen.getByLabelText('Go to page'), '0')
    await userEvent.click(screen.getByText('Go'))
    expect(mockHistoryPush).not.toHaveBeenCalled()

    await userEvent.clear(screen.getByLabelText('Go to page'))
    await userEvent.type(screen.getByLabelText('Go to page'), '3')
    await userEvent.click(screen.getByText('Go'))
    expect(mockHistoryPush).not.toHaveBeenCalled()
  })

  it('rejects a page jump beyond the safe integer range', async () => {
    renderPaginationItems(0, true, '/library/search/?number=K.1', 50, 9)

    const unsafePage = '99999999999999999'
    expect(Number(unsafePage)).toBeGreaterThan(Number.MAX_SAFE_INTEGER)

    const pageJumpInput = screen.getByLabelText('Go to page')
    await userEvent.type(pageJumpInput, unsafePage)
    await userEvent.click(screen.getByText('Go'))

    expect(mockHistoryPush).not.toHaveBeenCalled()
    expect(pageJumpInput).toHaveValue(Number(unsafePage))
  })

  it('requires the page-jump input and rejects an empty submission', async () => {
    renderPaginationItems(0, true, '/library/search/?number=K.1', 50, 9)

    const pageJumpInput = screen.getByLabelText('Go to page')
    expect(pageJumpInput).toBeRequired()
    expect(pageJumpInput).toHaveAttribute('min', '1')

    await userEvent.click(screen.getByText('Go'))

    expect(mockHistoryPush).not.toHaveBeenCalled()
  })
})

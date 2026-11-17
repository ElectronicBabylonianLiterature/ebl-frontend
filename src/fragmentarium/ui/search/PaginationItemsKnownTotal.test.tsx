import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockHistoryPush,
  renderPaginationItems,
} from 'fragmentarium/ui/search/PaginationItems.testSupport'

describe('PaginationItems known document totals', () => {
  it('shows numbered pages and bounded first and last controls', async () => {
    renderPaginationItems(2, true, '/library/search/?number=K.1#library', 50, 4)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('5')).toBeInTheDocument()
    await userEvent.click(screen.getByText('5'))

    expect(mockHistoryPush).toHaveBeenCalledWith({
      pathname: '/library/search/',
      search: 'number=K.1&paginationIndex=4',
      hash: '#library',
    })
  })

  it('uses ellipses around distant pages without rendering every page', () => {
    renderPaginationItems(50, true, '/library/search/?number=K.1', 50, 999)

    expect(screen.getAllByText('More')).toHaveLength(2)
    expect(screen.getByText('51')).toBeInTheDocument()
    expect(screen.queryByText('500')).not.toBeInTheDocument()
  })

  it('prevents jumping past a known last page', async () => {
    renderPaginationItems(0, true, '/library/search/?number=K.1', 50, 4)

    const pageJumpInput = screen.getByLabelText('Go to page')
    expect(pageJumpInput).toHaveAttribute('max', '5')
    await userEvent.type(pageJumpInput, '6')
    await userEvent.click(screen.getByText('Go'))

    expect(mockHistoryPush).not.toHaveBeenCalled()
  })

  it('omits numbered pages and Last when the document total is unknown', () => {
    renderPaginationItems(2, true, '/library/search/?number=K.1')

    expect(screen.getByText('Page 3')).toBeInTheDocument()
    expect(screen.queryByText('Last')).not.toBeInTheDocument()
  })

  it('offers First after the first page when the total is unknown', () => {
    renderPaginationItems(2, true, '/library/search/?number=K.1')

    expect(screen.getByText('First')).toBeInTheDocument()
  })

  it('omits First on the first page when the total is unknown', () => {
    renderPaginationItems(0, true, '/library/search/?number=K.1')

    expect(screen.queryByText('First')).not.toBeInTheDocument()
  })

  it('does not style the current page as disabled', () => {
    renderPaginationItems(2, true, '/library/search/?number=K.1', 50, 4)

    const currentPage = screen.getAllByRole('listitem')[4]
    expect(currentPage).toHaveTextContent('3')
    expect(currentPage).toHaveClass('active')
    expect(currentPage).not.toHaveClass('disabled')
  })

  it('keeps an unbounded page jump when the document total is unknown', () => {
    renderPaginationItems(2, true, '/library/search/?number=K.1')

    expect(screen.getByLabelText('Go to page')).not.toHaveAttribute('max')
  })

  it('hides the page jump when an unknown total has only one page', () => {
    renderPaginationItems(0, false, '/library/search/?number=K.1')

    expect(screen.queryByLabelText('Go to page')).not.toBeInTheDocument()
  })
})

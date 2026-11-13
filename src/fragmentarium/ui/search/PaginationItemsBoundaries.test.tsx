import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockHistoryPush,
  renderPaginationItems,
} from 'fragmentarium/ui/search/PaginationItems.testSupport'

const search = '/library/search/?number=K.1'

function pageItem(text: string): HTMLElement | null {
  return screen.getByText(text).closest('li')
}

function expectPush(paginationIndex: number): void {
  expect(mockHistoryPush).toHaveBeenLastCalledWith({
    pathname: '/library/search/',
    search: `number=K.1&paginationIndex=${paginationIndex}`,
    hash: '',
  })
}

describe('PaginationItems boundaries', () => {
  it('shows the current page as active without disabling it', async () => {
    renderPaginationItems(2, true, search, 50, 4)

    expect(pageItem('3')).toHaveClass('active')
    expect(pageItem('3')).not.toHaveClass('disabled')
    await userEvent.click(screen.getByText('3'))

    expect(mockHistoryPush).not.toHaveBeenCalled()
  })

  it('jumps to exactly the last page and rejects the page after it', async () => {
    renderPaginationItems(0, true, search, 50, 4)

    const pageJumpInput = screen.getByLabelText('Go to page')
    await userEvent.type(pageJumpInput, '6')
    await userEvent.click(screen.getByText('Go'))
    expect(mockHistoryPush).not.toHaveBeenCalled()

    await userEvent.clear(pageJumpInput)
    await userEvent.type(pageJumpInput, '5')
    await userEvent.click(screen.getByText('Go'))
    expectPush(4)
  })

  it.each([
    [0, true, false],
    [1, false, false],
    [3, false, false],
    [4, false, true],
  ])(
    'disables First and Last only at the edges (page %i)',
    (activePage, firstDisabled, lastDisabled) => {
      renderPaginationItems(activePage, true, search, 50, 4)

      expect(pageItem('First')?.classList.contains('disabled')).toBe(
        firstDisabled,
      )
      expect(pageItem('Last')?.classList.contains('disabled')).toBe(
        lastDisabled,
      )
    },
  )

  it('does not navigate from disabled First and Last controls', async () => {
    renderPaginationItems(0, true, search, 50, 0)

    await userEvent.click(screen.getByText('First'))
    await userEvent.click(screen.getByText('Last'))

    expect(mockHistoryPush).not.toHaveBeenCalled()
  })

  it('navigates to the first and last pages', async () => {
    renderPaginationItems(2, true, search, 50, 4)

    await userEvent.click(screen.getByText('First'))
    expectPush(0)
    await userEvent.click(screen.getByText('Last'))
    expectPush(4)
  })

  it('omits the page jump for a single known page', () => {
    renderPaginationItems(0, false, search, 50, 0)

    expect(screen.queryByLabelText('Go to page')).not.toBeInTheDocument()
  })

  it('offers the page jump when a second known page exists', () => {
    renderPaginationItems(0, true, search, 50, 1)

    expect(screen.getByLabelText('Go to page')).toBeInTheDocument()
  })
})

import { fireEvent, screen } from '@testing-library/react'
import {
  mockHistoryPush,
  renderPaginationItems,
} from 'fragmentarium/ui/search/PaginationItems.testSupport'

describe('PaginationItems link clicks', () => {
  it.each([
    ['middle', { button: 1 }],
    ['Meta', { metaKey: true }],
    ['Control', { ctrlKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
  ])('leaves %s click navigation to the browser', (_name, clickOptions) => {
    renderPaginationItems(0, true)
    const nextLink = screen.getByText('Next')
    nextLink.addEventListener('click', (event) => event.preventDefault())

    fireEvent.click(nextLink, clickOptions)

    expect(mockHistoryPush).not.toHaveBeenCalled()
    expect(nextLink).toHaveAttribute(
      'href',
      '/library/search/?paginationIndex=1',
    )
  })
})

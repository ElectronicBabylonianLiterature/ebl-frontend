import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockHistoryPush,
  renderPaginationItems,
} from 'fragmentarium/ui/search/PaginationItems.testSupport'

describe('PaginationItems', () => {
  it('renders a named navigation landmark with centered control groups', () => {
    renderPaginationItems(0, true, '/library/search/', 50, 9)

    expect(
      screen.getByRole('navigation', {
        name: 'Search results pagination, top',
      }),
    ).toHaveClass('fragment-result__pagination')
    expect(screen.getByText('Go to page')).toBeVisible()
    expect(screen.getByText('Results per page')).toBeVisible()
    expect(screen.getByLabelText('Go to page')).toHaveClass(
      'fragment-result__pagination-page-input',
    )
    expect(screen.getByLabelText('Results per page')).toHaveClass(
      'fragment-result__pagination-page-size',
    )
    expect(screen.getByRole('list', { name: 'Pages' })).toHaveClass(
      'pagination-sm',
      'fragment-result__pagination-pages',
    )
  })

  it('associates each visible label with its own control', () => {
    renderPaginationItems(0, true, '/library/search/', 50, 9)

    const pageJumpLabel = screen.getByText('Go to page')
    const pageSizeLabel = screen.getByText('Results per page')

    expect(pageJumpLabel).toHaveAttribute(
      'for',
      screen.getByLabelText('Go to page').id,
    )
    expect(pageSizeLabel).toHaveAttribute(
      'for',
      screen.getByLabelText('Results per page').id,
    )
    expect(screen.getByLabelText('Go to page').id).not.toEqual(
      screen.getByLabelText('Results per page').id,
    )
  })
  it('disables Previous on page zero and shows the one-based page number', () => {
    renderPaginationItems(0, true)

    expect(screen.getAllByRole('listitem')[0]).toHaveClass('disabled')
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[2]).not.toHaveClass('disabled')
  })

  it('ignores clicks on the disabled Previous control', async () => {
    renderPaginationItems(0, true)

    await userEvent.click(screen.getByText('Previous'))

    expect(mockHistoryPush).not.toHaveBeenCalled()
  })

  it('uses hasNextPage as the only Next navigation signal', () => {
    renderPaginationItems(4, false)

    expect(screen.getAllByRole('listitem')[0]).not.toHaveClass('disabled')
    expect(screen.getByText('Page 5')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[2]).toHaveClass('disabled')
  })

  it('preserves encoded query values when going next', async () => {
    renderPaginationItems(
      0,
      true,
      '/library/search/?museum=BM&number=000123&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries',
    )

    await userEvent.click(screen.getByText('Next'))

    expect(mockHistoryPush).toHaveBeenLastCalledWith({
      pathname: '/library/search/',
      search:
        'museum=BM&number=000123&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries&paginationIndex=1',
      hash: '',
    })
  })

  it('removes duplicate paginationIndex params when paginating', async () => {
    renderPaginationItems(
      4,
      true,
      '/library/search/?museum=BM&paginationIndex=4&genre=letters&paginationIndex=99',
    )

    await userEvent.click(screen.getByText('Previous'))

    expect(mockHistoryPush).toHaveBeenLastCalledWith({
      pathname: '/library/search/',
      search: 'museum=BM&paginationIndex=3&genre=letters',
      hash: '',
    })
  })

  it('preserves encoded query values when changing page size', async () => {
    renderPaginationItems(
      2,
      true,
      '/library/search/?museum=BM&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries&transliteration=a%2Bb&number=000123',
    )

    await userEvent.selectOptions(
      screen.getByLabelText('Results per page'),
      '100',
    )

    expect(mockHistoryPush).toHaveBeenLastCalledWith({
      pathname: '/library/search/',
      search:
        'museum=BM&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries&transliteration=a%2Bb&number=000123&limit=100&paginationIndex=0',
      hash: '',
    })
  })

  it('shows the page size it was given rather than re-deriving it', () => {
    renderPaginationItems(0, true, '/library/search/?limit=50', 25)

    expect(screen.getByLabelText('Results per page')).toHaveValue('25')
  })
})

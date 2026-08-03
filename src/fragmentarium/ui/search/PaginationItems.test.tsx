import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaginationItems from 'fragmentarium/ui/search/PaginationItems'

const mockHistoryPush = jest.fn()

jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({
    push: mockHistoryPush,
    replace: jest.fn(),
    location: { pathname: '/library/search/', search: '' },
  }),
}))

function renderPaginationItems(
  activePage = 0,
  hasNextPage = true,
  initialEntry = '/library/search/',
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PaginationItems
        paginationURLParam="paginationIndex"
        activePage={activePage}
        hasNextPage={hasNextPage}
      />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockHistoryPush.mockClear()
})

describe('PaginationItems', () => {
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
      search:
        'museum=BM&number=000123&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries&paginationIndex=1',
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
      search: 'museum=BM&paginationIndex=3&genre=letters',
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
      search:
        'museum=BM&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries&transliteration=a%2Bb&number=000123&limit=100&paginationIndex=0',
    })
  })

  it('jumps directly to a requested page', async () => {
    renderPaginationItems(0, true, '/library/search/?number=K.1')

    await userEvent.type(screen.getByLabelText('Go to page'), '4')
    await userEvent.click(screen.getByText('Go'))

    expect(mockHistoryPush).toHaveBeenLastCalledWith({
      search: 'number=K.1&paginationIndex=3',
    })
  })

  it('ignores invalid and current page jump requests', async () => {
    renderPaginationItems(2, true, '/library/search/?number=K.1')

    await userEvent.type(screen.getByLabelText('Go to page'), '0')
    await userEvent.click(screen.getByText('Go'))
    expect(mockHistoryPush).not.toHaveBeenCalled()

    await userEvent.clear(screen.getByLabelText('Go to page'))
    await userEvent.type(screen.getByLabelText('Go to page'), '3')
    await userEvent.click(screen.getByText('Go'))
    expect(mockHistoryPush).not.toHaveBeenCalled()
  })
})

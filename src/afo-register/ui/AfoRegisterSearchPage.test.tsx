import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AfoRegisterSearchPage from 'afo-register/ui/AfoRegisterSearchPage'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'

jest.mock('afo-register/ui/AfoRegisterSearchForm', () => ({
  __esModule: true,
  default: () => <div data-testid="search-form">Search Form</div>,
}))

jest.mock('afo-register/ui/AfoRegisterSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="search-results">Search Results</div>,
}))

let afoRegisterService: AfoRegisterService
let fragmentService: FragmentService

beforeEach(() => {
  afoRegisterService = {} as AfoRegisterService
  fragmentService = {} as FragmentService
})

function renderPage(path = '/tools/afo-register'): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AfoRegisterSearchPage
        afoRegisterService={afoRegisterService}
        fragmentService={fragmentService}
      />
    </MemoryRouter>,
  )
}

describe('AfoRegisterSearchPage', () => {
  it('renders introduction, inline about link, and search form', () => {
    renderPage()

    expect(screen.getByText(/Archiv für Orientforschung/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Learn more about AfO-Register' }),
    ).toHaveAttribute('href', '/about/bibliography#afo-register')
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
  })

  it('renders search results when text query is provided', () => {
    renderPage('/tools/afo-register?text=test')

    expect(screen.getByTestId('search-results')).toBeInTheDocument()
  })

  it('does not render search results when no text query is provided', () => {
    renderPage('/tools/afo-register')

    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument()
  })
})

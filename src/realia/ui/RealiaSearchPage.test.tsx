import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaSearchPage from 'realia/ui/RealiaSearchPage'
import RealiaService from 'realia/application/RealiaService'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'

jest.mock('common/ui/Markdown', () => ({
  __esModule: true,
  MarkdownParagraph: ({ text }: { text: string }) => <p>{text}</p>,
}))

jest.mock('realia/ui/RealiaSearchForm', () => ({
  __esModule: true,
  default: () => <div data-testid="search-form">Search Form</div>,
}))

jest.mock('realia/ui/RealiaSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="search-results">Search Results</div>,
}))

const realiaService = {} as RealiaService

function renderPage(
  path = '/tools/realia',
  session = new MemorySession(['read:realia']),
): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <RealiaSearchPage realiaService={realiaService} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

describe('RealiaSearchPage', () => {
  it('renders intro text and search form', () => {
    renderPage()
    expect(screen.getByText(/Dictionary of Realia/i)).toBeInTheDocument()
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
  })

  it('renders search results with query in URL', () => {
    renderPage('/tools/realia?query=pig')
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
  })

  it('does not render search results when there is no query', () => {
    renderPage('/tools/realia')
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument()
  })

  it('shows login message and no form when session lacks readRealia scope', () => {
    renderPage('/tools/realia', new MemorySession([]))
    expect(
      screen.getByText('Please log in to browse the Dictionary of Realia.'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('search-form')).not.toBeInTheDocument()
  })
})

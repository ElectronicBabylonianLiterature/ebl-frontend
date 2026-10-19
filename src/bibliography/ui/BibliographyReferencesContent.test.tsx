import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import BibliographyReferencesContent from 'bibliography/ui/BibliographyReferencesContent'
import BibliographyService from 'bibliography/application/BibliographyService'

jest.mock('bibliography/ui/BibliographySearchForm', () => ({
  __esModule: true,
  default: (props: { query: string }) => (
    <div data-testid="search-form">{props.query}</div>
  ),
}))

jest.mock('bibliography/ui/BibliographySearch', () => ({
  __esModule: true,
  default: () => <div data-testid="search-results">Search Results</div>,
}))

const readScope = 'read:bibliography'
const writeScope = 'write:bibliography'
let bibliographyService: jest.Mocked<Pick<BibliographyService, 'search'>>

beforeEach(() => {
  bibliographyService = {
    search: jest.fn().mockReturnValue(Promise.resolve([])),
  }
})

function renderContent(
  path = '/tools/references',
  scopes: readonly string[] = [readScope],
): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={new MemorySession(scopes)}>
        <BibliographyReferencesContent
          bibliographyService={bibliographyService}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

describe('BibliographyReferencesContent', () => {
  it('renders introduction, inline about link, and search when user has access', () => {
    renderContent()

    expect(screen.getByText(/comprehensive collection of/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Learn more about Bibliography' }),
    ).toHaveAttribute('href', '/about/bibliography')
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
  })

  it('displays login message when user is not allowed', () => {
    renderContent('/tools/references', [])

    expect(
      screen.getByText('Please log in to browse the Bibliography.'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('search-form')).not.toBeInTheDocument()
  })

  it('passes query from URL to search form', () => {
    renderContent('/tools/references?query=TestQuery')

    expect(screen.getByTestId('search-form')).toHaveTextContent('TestQuery')
  })

  it('passes empty query when no query parameter exists', () => {
    renderContent('/tools/references')

    expect(screen.getByTestId('search-form')).toHaveTextContent('')
  })

  it('links to the new reference route when user has write access', () => {
    renderContent('/tools/references', [readScope, writeScope])

    expect(screen.getByRole('link', { name: /Create/ })).toHaveAttribute(
      'href',
      '/tools/references/new-reference',
    )
  })

  it('joins a repeated query parameter into one query', () => {
    renderContent('/tools/references?query=Test&query=Query')

    expect(screen.getByTestId('search-form')).toHaveTextContent('TestQuery')
  })

  it('shows a disabled create button without write access', () => {
    renderContent()

    expect(screen.getByRole('button', { name: /Create/ })).toBeDisabled()
  })
})

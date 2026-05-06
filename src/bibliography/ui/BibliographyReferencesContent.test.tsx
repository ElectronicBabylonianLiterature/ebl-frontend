import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import BibliographyReferencesContent from 'bibliography/ui/BibliographyReferencesContent'
import BibliographyService from 'bibliography/application/BibliographyService'
import Promise from 'bluebird'

jest.mock('bibliography/ui/BibliographySearchForm', () => ({
  __esModule: true,
  default: (props) => <div data-testid="search-form">{props.query}</div>,
}))

jest.mock('bibliography/ui/BibliographySearch', () => ({
  __esModule: true,
  default: () => <div data-testid="search-results">Search Results</div>,
}))

let session
let bibliographyService

beforeEach(() => {
  session = {
    isAllowedToReadBibliography: jest.fn(),
    isAllowedToWriteBibliography: jest.fn(() => false),
  }
  bibliographyService = {
    search: jest.fn().mockReturnValue(Promise.resolve([])),
  }
})

function renderContent(path = '/tools/references'): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <BibliographyReferencesContent
          bibliographyService={
            bibliographyService as unknown as BibliographyService
          }
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

describe('BibliographyReferencesContent', () => {
  it('renders introduction, inline about link, and search when user has access', () => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    renderContent()

    expect(screen.getByText(/comprehensive collection of/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Learn more about Bibliography' }),
    ).toHaveAttribute('href', '/about/bibliography')
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
  })

  it('displays login message when user is not allowed', () => {
    session.isAllowedToReadBibliography.mockReturnValue(false)
    renderContent()

    expect(
      screen.getByText('Please log in to browse the Bibliography.'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('search-form')).not.toBeInTheDocument()
  })

  it('passes query from URL to search form', () => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    renderContent('/tools/references?query=TestQuery')

    expect(screen.getByTestId('search-form')).toHaveTextContent('TestQuery')
  })

  it('passes empty query when no query parameter exists', () => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    renderContent('/tools/references')

    expect(screen.getByTestId('search-form')).toHaveTextContent('')
  })

  it('links to the new reference route when user has write access', () => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    session.isAllowedToWriteBibliography.mockReturnValue(true)
    renderContent('/tools/references')

    expect(screen.getByRole('link', { name: /Create/ })).toHaveAttribute(
      'href',
      '/tools/references/new-reference',
    )
  })
})

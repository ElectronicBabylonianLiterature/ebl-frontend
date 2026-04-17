import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import BibliographyReferencesContent from './BibliographyReferencesContent'
import BibliographyService from 'bibliography/application/BibliographyService'
import Promise from 'bluebird'

jest.mock('./BibliographySearchForm', () => ({
  __esModule: true,
  default: (props) => <div data-testid="search-form">{props.query}</div>,
}))

jest.mock('./BibliographySearch', () => ({
  __esModule: true,
  default: () => <div data-testid="search-results">Search Results</div>,
}))

let session
let bibliographyService

beforeEach(() => {
  session = {
    isAllowedToReadBibliography: jest.fn(),
    isAllowedToWriteBibliography: (): boolean => false,
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
  it('renders info banner, introduction, and search when user has access', () => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    renderContent()

    expect(screen.getByText(/Bibliography/)).toBeInTheDocument()
    expect(screen.getByText(/comprehensive collection of/i)).toBeInTheDocument()
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
})

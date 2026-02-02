import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import Bibliography from './Bibliography'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

let entries: BibliographyEntry[]
let bibliographyService
let afoRegisterService
let fragmentService
let session

beforeEach(() => {
  entries = bibliographyEntryFactory.buildList(2)
  bibliographyService = {
    search: jest.fn(),
  }
  afoRegisterService = {
    search: jest.fn(),
  }
  fragmentService = {
    query: jest.fn(),
  }
  session = {
    isAllowedToReadBibliography: jest.fn(),
    isAllowedToWriteBibliography: (): boolean => false,
  }
})

describe('Searching bibliography and AfO-Register', () => {
  beforeEach(() => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    bibliographyService.search.mockReturnValue(Promise.resolve(entries))
    afoRegisterService.search.mockReturnValue(Promise.resolve([]))
    fragmentService.query.mockReturnValue(Promise.resolve([]))
  })

  it('displays result on successful query', async () => {
    await renderBibliography(
      '/bibliography/references?query=Borger',
      'references',
    )
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(entries.length)
    })
  })

  it('fills in search form query', async () => {
    renderBibliography('/bibliography/references?query=Borger', 'references')

    const queryInput = await screen.findByLabelText('Bibliography-Query')
    expect(queryInput).toHaveValue('Borger')
  })

  it('displays empty search if no query', async () => {
    renderBibliography('/bibliography/references', 'references')

    const queryInput = await screen.findByLabelText('Bibliography-Query')
    expect(queryInput).toHaveValue('')
  })

  it('displays a message if user is not logged in', async () => {
    session.isAllowedToReadBibliography.mockReturnValueOnce(false)
    renderBibliography('/bibliography/references', 'references')
    expect(
      screen.getByText('Please log in to browse the Bibliography.'),
    ).toBeInTheDocument()
  })

  it('renders content based on session state', () => {
    session.isAllowedToReadBibliography.mockReturnValue(false)
    renderBibliography('/bibliography/references', 'references')

    expect(
      screen.getByText('Please log in to browse the Bibliography.'),
    ).toBeInTheDocument()
  })

  it('handles URL queries correctly', () => {
    renderBibliography('/bibliography/references?query=TestQuery', 'references')
    const queryInput = screen.getByLabelText('Bibliography-Query')
    expect(queryInput).toHaveValue('TestQuery')
  })
})

function renderBibliography(
  path: string,
  activeTab: 'references' | 'afo-register',
): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <Bibliography
          bibliographyService={bibliographyService}
          afoRegisterService={afoRegisterService}
          fragmentService={fragmentService}
          activeTab={activeTab}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

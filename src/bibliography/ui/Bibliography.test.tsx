import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import Bibliography from './Bibliography'
import createAuthorRegExp from 'test-support/createAuthorRexExp'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

const BibliographyWithRouter = withRouter(Bibliography)

let entries: BibliographyEntry[]
let bibliographyService
let afoRegisterService
let session

beforeEach(() => {
  entries = bibliographyEntryFactory.buildList(2)
  bibliographyService = {
    search: jest.fn(),
  }
  afoRegisterService = {
    search: jest.fn(),
  }
  session = {
    isAllowedToReadBibliography: jest.fn(),
    isAllowedToWriteBibliography: (): boolean => false,
  }
})

describe('Searching bibliography', () => {
  beforeEach(() => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    bibliographyService.search.mockReturnValue(Promise.resolve(entries))
    afoRegisterService.search.mockReturnValue(Promise.resolve([]))
  })

  it('displays result on successfull query', async () => {
    await act(async () => {
      await renderBibliography(
        '/bibliography/references?query=Borger',
        'references'
      )
    })
    expect(
      await screen.findByText(createAuthorRegExp(entries[0]))
    ).toBeInTheDocument()
    expect(screen.getByText(createAuthorRegExp(entries[1]))).toBeInTheDocument()
  })

  it('fills in search form query', async () => {
    await act(async () => {
      renderBibliography('/bibliography/references?query=Borger', 'references')
    })

    expect(await screen.findByLabelText('Bibliography-Query')).toHaveValue(
      'Borger'
    )
  })

  it('displays empty search if no query', async () => {
    await act(async () => {
      renderBibliography('/bibliography/references', 'references')
    })

    expect(await screen.findByLabelText('Bibliography-Query')).toHaveValue('')
  })
})

it('Displays a message if user is not logged in', async () => {
  session.isAllowedToReadBibliography.mockReturnValueOnce(false)
  await act(async () => {
    renderBibliography('/bibliography/references', 'references')
  })
  expect(
    screen.getByText('Please log in to browse the Bibliography.')
  ).toBeInTheDocument()
})

function renderBibliography(
  path: string,
  activeTab: 'references' | 'afo-register'
): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <BibliographyWithRouter
          bibliographyService={bibliographyService}
          afoRegisterService={afoRegisterService}
          activeTab={activeTab}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
}

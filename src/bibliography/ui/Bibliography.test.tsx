import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import Bibliography from './Bibliography'
import createAuthorRegExp from 'test-support/createAuthorRexExp'

const BibliographyWithRouter = withRouter(Bibliography)

let entries
let bibliographyService
let session

beforeEach(async () => {
  entries = await factory.buildMany('bibliographyEntry', 2)
  bibliographyService = {
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
    bibliographyService.search.mockReturnValueOnce(Promise.resolve(entries))
  })

  it('displays result on successfull query', async () => {
    renderDictionary('/bibliography?query=Borger')

    expect(
      await screen.findByText(createAuthorRegExp(entries[0]))
    ).toBeInTheDocument()
    expect(screen.getByText(createAuthorRegExp(entries[1]))).toBeInTheDocument()
  })

  it('fills in search form query', async () => {
    renderDictionary('/bibliography?query=Borger')

    expect(await screen.findByLabelText('Query')).toHaveValue('Borger')
  })

  it('displays empty search if no query', async () => {
    renderDictionary('/bibliography')

    expect(await screen.findByLabelText('Query')).toHaveValue('')
  })
})

it('Displays a message if user is not logged in', async () => {
  session.isAllowedToReadBibliography.mockReturnValueOnce(false)

  renderDictionary('/bibliography')

  expect(
    screen.getByText('Please log in to browse the Bibliography.')
  ).toBeInTheDocument()
})

function renderDictionary(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <BibliographyWithRouter bibliographyService={bibliographyService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
}

import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import Bibliography from './Bibliography'

const BibliographyWithRouter = withRouter(Bibliography)

let entries
let bibliographyService
let session

beforeEach(async () => {
  entries = await factory.buildMany('bibliographyEntry', 2)
  bibliographyService = {
    search: jest.fn()
  }
  session = {
    isAllowedToReadBibliography: jest.fn(),
    isAllowedToWriteBibliography: () => false
  }
})

describe('Searching bibliography', () => {
  beforeEach(() => {
    session.isAllowedToReadBibliography.mockReturnValue(true)
    bibliographyService.search.mockReturnValueOnce(Promise.resolve(entries))
  })

  it('displays result on successfull query', async () => {
    const { getByText } = renderDictionary('/bibliography?query=Borger')

    await waitForElement(() => getByText(new RegExp(entries[0].author)))
    expect(getByText(new RegExp(entries[1].author))).toBeDefined()
  })

  it('fills in search form query', () => {
    const { getByLabelText } = renderDictionary('/bibliography?query=Borger')

    expect(getByLabelText('Query').value).toEqual('Borger')
  })

  it('displays empty search if no query', () => {
    const { getByLabelText } = renderDictionary('/bibliography')

    expect(getByLabelText('Query').value).toEqual('')
  })
})

it('Displays a message if user is not logged in', () => {
  session.isAllowedToReadBibliography.mockReturnValueOnce(false)

  const { container } = renderDictionary('/bibliography')

  expect(container).toHaveTextContent('Please log in to browse the Bibliography.')
})

function renderDictionary (path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <BibliographyWithRouter bibliographyService={bibliographyService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
}

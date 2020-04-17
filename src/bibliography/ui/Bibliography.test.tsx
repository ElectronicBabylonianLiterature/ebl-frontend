import React from 'react'
import _ from 'lodash'
import { render, RenderResult, act } from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import Bibliography from './Bibliography'

const BibliographyWithRouter = withRouter<any, any>(Bibliography)

let element: RenderResult
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
    const { getByText, findByText } = await renderDictionary(
      '/bibliography?query=Borger'
    )

    await findByText(new RegExp(_.escapeRegExp(entries[0].primaryAuthor)))

    expect(
      getByText(new RegExp(_.escapeRegExp(entries[1].primaryAuthor)))
    ).toBeDefined()
  })

  it('fills in search form query', async () => {
    const { getByLabelText } = await renderDictionary(
      '/bibliography?query=Borger'
    )

    expect((getByLabelText('Query') as HTMLInputElement).value).toEqual(
      'Borger'
    )
  })

  it('displays empty search if no query', async () => {
    const { getByLabelText } = await renderDictionary('/bibliography')

    expect((getByLabelText('Query') as HTMLInputElement).value).toEqual('')
  })
})

it('Displays a message if user is not logged in', async () => {
  session.isAllowedToReadBibliography.mockReturnValueOnce(false)

  const { container } = await renderDictionary('/bibliography')

  expect(container).toHaveTextContent(
    'Please log in to browse the Bibliography.'
  )
})

async function renderDictionary(path: string): Promise<RenderResult> {
  await act(async () => {
    element = render(
      <MemoryRouter initialEntries={[path]}>
        <SessionContext.Provider value={session}>
          <BibliographyWithRouter bibliographyService={bibliographyService} />
        </SessionContext.Provider>
      </MemoryRouter>
    )
  })
  return element
}

import React from 'react'
import { Router, withRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import SearchForms from './SearchForm'
import { createMemoryHistory, MemoryHistory } from 'history'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import userEvent from '@testing-library/user-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('auth/Session')
jest.mock('fragmentarium/application/FragmentSearchService')

let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let session: jest.Mocked<Session>

let number: string
let id: string
let title: string
let primaryAuthor: string
let year: string
let pages: string
let transliteration: string

let history: MemoryHistory
let searchEntry: BibliographyEntry

async function renderSearchForms() {
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const SearchFormsWithRouter = withRouter<any, typeof SearchForms>(SearchForms)
  render(
    <Router history={history}>
      <SessionContext.Provider value={session}>
        <SearchFormsWithRouter
          number={number}
          id={id}
          primaryAuthor={primaryAuthor}
          year={year}
          title={title}
          pages={pages}
          transliteration={transliteration}
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
        />
      </SessionContext.Provider>
    </Router>
  )
}

beforeEach(async () => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()

  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
  searchEntry = await factory.build('bibliographyEntry')
  fragmentService.searchBibliography.mockReturnValue(
    Promise.resolve([searchEntry])
  )
  session.isAllowedToReadFragments.mockReturnValue(true)
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  await renderSearchForms()
})
describe('User Input', () => {
  it('Displys User Input in NumbersSearchForm', async () => {
    const userInput = 'RN0'
    userEvent.type(screen.getByLabelText('Number'), userInput)
    expect(screen.getByLabelText('Number')).toHaveValue(userInput)
  })

  it('Displays User Input in TranslierationSearchForm', async () => {
    const userInput = 'ma i-ra\nka li'
    userEvent.type(screen.getByLabelText('Transliteration'), userInput)
    await waitFor(() =>
      expect(screen.getByLabelText('Transliteration')).toHaveTextContent(
        userInput.replace(/\n/g, ' ')
      )
    )
  })

  it('Displays User Input in BibliographySelect', async () => {
    const userInput = 'Borger'
    userEvent.type(
      screen.getByLabelText('Select bibliography reference'),
      userInput
    )
    await waitFor(() =>
      expect(
        screen.getByLabelText('Select bibliography reference')
      ).toHaveValue(userInput)
    )
  })
})

describe('Click Search', () => {
  it('Search Transliteration', async () => {
    const transliteration = 'ma i-ra'
    userEvent.type(screen.getByLabelText('Transliteration'), transliteration)
    userEvent.click(screen.getByText('Search'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith(
        '/fragmentarium/search/?id=&number=&pages=&primaryAuthor=&title=&transliteration=ma%20i-ra&year='
      )
    )
  })
})

import React from 'react'
import { Router, withRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import SearchForms from './SearchForm'
import { createMemoryHistory } from 'history'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import userEvent from '@testing-library/user-event'

let number: string
let id: string
let title: string
let primaryAuthor: string
let year: string
let pages: string
let transliteration: string
let fragmentService: {
  searchBibliography: jest.Mock
}
let fragmentSearchService: {
  random: jest.Mock
  interesting: jest.Mock
}

let session
let history
let searchEntry: BibliographyEntry

async function renderSearchForms() {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const SearchFormsWithRouter = withRouter<any, any>(SearchForms)
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
  searchEntry = await factory.build('bibliographyEntry')
  fragmentService = {
    searchBibliography: jest.fn(),
  }
  fragmentService.searchBibliography.mockReturnValue(
    Promise.resolve([searchEntry])
  )
  fragmentSearchService = {
    random: jest.fn(),
    interesting: jest.fn(),
  }
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: jest.fn(),
  }
  session.isAllowedToReadFragments.mockReturnValue(true)
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  await renderSearchForms()
})
describe('User Input', () => {
  it('Displys User Input in NumbersSearchForm', async () => {
    const userInput = 'RN0'
    await userEvent.type(screen.getByLabelText('Number'), userInput)
    expect(screen.getByLabelText('Number')).toHaveValue(userInput)
  })

  it('Displays User Input in TranslierationSearchForm', async () => {
    const userInput = 'ma i-ra\nka li'
    await userEvent.type(screen.getByLabelText('Transliteration'), userInput)
    await waitFor(() =>
      expect(screen.getByLabelText('Transliteration')).toHaveTextContent(
        userInput.replace('\n', ' ')
      )
    )
  })

  it('Displays User Input in BibliographySelect', async () => {
    const userInput = 'Borger'
    await userEvent.type(
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
    await userEvent.type(
      screen.getByLabelText('Transliteration'),
      transliteration
    )
    userEvent.click(screen.getByText('Search'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith(
        '/fragmentarium/search/?id=&number=&pages=&primaryAuthor=&title=&transliteration=ma%20i-ra&year='
      )
    )
  })
})

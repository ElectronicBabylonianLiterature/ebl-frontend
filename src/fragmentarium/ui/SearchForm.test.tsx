import React from 'react'
import { withRouter } from 'react-router-dom'
import { Router } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import { changeValueByLabel, whenClicked } from 'test-support/utils'
import SearchForms from './SearchForm'
import { createMemoryHistory } from 'history'
import {
  fillBibliographySelect,
  expectedLabel,
} from 'test-support/test-bibliographySelect'
import BibliographyEntry from '../../bibliography/domain/BibliographyEntry'

let number: string
let id: string
let title: string
let primaryAuthor: string
let year: string
let pages: string
let transliteration: string
let fragmentService: any
let fragmentSearchService: any
let session: any
let element: RenderResult
let history: any
let entry: BibliographyEntry
let searchEntry: BibliographyEntry

async function renderSearchForms() {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const SearchFormsWithRouter = withRouter<any, any>(SearchForms)
  element = render(
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
  entry = await factory.build('bibliographyEntry')
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

    changeValueByLabel(element, 'Number', userInput)
    expect(element.getByLabelText('Number')).toHaveValue(userInput)
  })

  it('Displays User Input in TranslierationSearchForm', async () => {
    const userInput = 'ma i-ra\nka li'

    changeValueByLabel(element, 'Transliteration', userInput)
    expect(element.getByLabelText('Transliteration')).toHaveTextContent(
      userInput.replace('\n', ' ')
    )
  })

  it('Displays User Input in BibliographySelect', async () => {
    await fillBibliographySelect(
      searchEntry,
      'BibliographySelectSearchForm__label',
      element,
      'Borger'
    )
    expect(element.container).toHaveTextContent(expectedLabel(searchEntry))
  })
})

describe('Click Search', () => {
  it('Search Transliteration', async () => {
    const transliteration = 'ma i-ra'

    changeValueByLabel(element, 'Transliteration', transliteration)
    await whenClicked(element, 'Search')
      .expect(history.push)
      .toHaveBeenCalledWith(
        '/fragmentarium/search/?id=&number=&pages=&primaryAuthor=&title=&transliteration=ma%20i-ra&year='
      )
  })
})

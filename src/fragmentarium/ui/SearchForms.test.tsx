/**  * @jest-environment jsdom-sixteen  */
import React from 'react'
import { withRouter } from 'react-router-dom'
import { Router } from 'react-router-dom'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import { changeValueByLabel, whenClicked } from 'test-support/utils'
import SearchForms from './SearchForms'
import { createMemoryHistory } from 'history'
import { fill, expectedLabel } from 'test-support/test-bibliographySelect'

let number
let id
let title
let primaryAuthor
let year
let pages
let transliteration
let fragmentService
let fragmentSearchService
let session
let container
let element
let history

let entry
let searchEntry

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
  container = element.container
  await element.getByLabelText('Number')
  await element.getByLabelText('Pages')
  await element.getByLabelText('Transliteration')
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
    await expect(await element.getByLabelText('Number')).toHaveValue(userInput)
  })

  it('Displays User Input in TranslierationSearchForm', async () => {
    const userInput = 'ma i-ra\nka li'

    changeValueByLabel(element, 'Transliteration', userInput)
    expect(await element.getByLabelText('Transliteration')).toHaveTextContent(
      userInput.replace('\n', ' ')
    )
  })

  it('Displays User Input in BibliographySelect', async () => {
    await fill(searchEntry, 'BibliographySelect', element, 'Borger')
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

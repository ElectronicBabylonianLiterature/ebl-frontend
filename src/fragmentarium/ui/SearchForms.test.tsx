import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, waitFor } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import { changeValueByLabel, clickNth } from 'test-support/utils'
import SearchForms from './SearchForms'
import BibliographyEntry from '../../bibliography/domain/BibliographyEntry'

let bibliographyEntry
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

async function renderSearchForms() {
  const SearchFormsWithRouter = withRouter<any, any>(SearchForms)
  element = render(
    <MemoryRouter>
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
    </MemoryRouter>
  )
  container = element.container
  await element.getByLabelText('Number')
  await element.getByLabelText('Pages')
  await element.getByLabelText('Transliteration')
}

beforeEach(async () => {
  bibliographyEntry = await factory.build('bibliographyEntry')
  fragmentService = {
    searchBibliography: jest.fn(),
  }
  fragmentSearchService = {
    random: jest.fn(),
    interesting: jest.fn(),
  }
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: jest.fn(),
  }
  fragmentService.searchBibliography.mockReturnValueOnce(
    Promise.resolve(bibliographyEntry)
  )
  session.isAllowedToReadFragments.mockReturnValue(true)
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
})

describe('Displays User Input', () => {
  beforeEach(async () => {
    await renderSearchForms()
  })
  it("Displays User Input in NumbersSearchForm'", async () => {
    const number = 'RN0'

    changeValueByLabel(element, 'Number', number)
    expect(await element.getByLabelText('Number')).toHaveTextContent(number)
  })
  it('Displays User Input in TranslierationSearchForm', async () => {
    const transliteration = 'ma i-ra\nka li'

    changeValueByLabel(element, 'Transliteration', transliteration)
    expect(await element.getByLabelText('Transliteration')).toHaveTextContent(
      transliteration.replace('\n', ' ')
    )
  })
  it("Displays User Input in ReferenceSearchForm'", async () => {
    pages = bibliographyEntry.cslData.page

    changeValueByLabel(element, 'Entry', expectedLabel(bibliographyEntry))
    changeValueByLabel(element, 'Pages', pages)
    expect(element.container).toHaveTextContent(
      expectedLabel(bibliographyEntry)
    )
    expect(await element.getByLabelText('Pages')).toHaveTextContent(pages)
  })
})

function expectedLabel(entry: BibliographyEntry): string {
  return `${entry.primaryAuthor} ${entry.year} ${entry.title}`
}

describe('Search', () => {
  beforeEach(async () => {
    const random = await factory.build('fragment')
    fragmentSearchService.random.mockReturnValueOnce(Promise.resolve([random]))
    await renderSearchForms()
  })
})

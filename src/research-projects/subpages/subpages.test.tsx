import React from 'react'
import Promise from 'bluebird'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import CaicPage from './caic'
import BibliographyService from 'bibliography/application/BibliographyService'
import { render } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from 'history'
import { Router, withRouter } from 'react-router-dom'
import Session from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('auth/Session')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')

let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let wordService: jest.Mocked<WordService>
let bibliographyService: jest.Mocked<BibliographyService>
let container: HTMLElement
let session: jest.Mocked<Session>
let history: MemoryHistory

async function renderProjectPage() {
  const CaicPageWithRouter = withRouter<any, typeof CaicPage>(CaicPage)
  container = render(
    <Router history={history}>
      <SessionContext.Provider value={session}>
        <CaicPageWithRouter
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
          wordService={wordService}
          bibliographyService={bibliographyService}
        />
      </SessionContext.Provider>
    </Router>
  ).container
}

beforeEach(async () => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  history = createMemoryHistory()
  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
  session.isAllowedToReadFragments.mockReturnValue(true)
  fragmentService.fetchPeriods.mockReturnValue(Promise.resolve([]))
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve([]))
  wordService.findAll.mockReturnValue(Promise.resolve([]))
})

describe('Project pages', () => {
  it('displays CAIC page', async () => {
    await renderProjectPage()
    expect(container).toMatchSnapshot()
  })
})

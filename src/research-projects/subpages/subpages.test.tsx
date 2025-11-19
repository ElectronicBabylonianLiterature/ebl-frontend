import React from 'react'
import Promise from 'bluebird'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import BibliographyService from 'bibliography/application/BibliographyService'
import { act, render } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from 'history'
import { Router, withRouter } from 'react-router-dom'
import Session from 'auth/Session'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import {
  ResearchProject,
  ResearchProjects,
} from 'research-projects/researchProject'
import CAICHome from 'research-projects/subpages/caic/Home'
import AluGenevaHome from './aluGeneva/Home'
import AmpsHome from 'research-projects/subpages/amps/Home'
import ReccHome from 'research-projects/subpages/recc/Home'

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

async function renderProjectPage(PageComponent, project: ResearchProject) {
  const PageWithRouter = withRouter<any, typeof PageComponent>(PageComponent)
  await act(async () => {
    container = render(
      <Router history={history}>
        <SessionContext.Provider value={session}>
          <PageWithRouter
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            project={project}
          />
        </SessionContext.Provider>
      </Router>
    ).container
  })
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
  fragmentService.fetchProvenances.mockReturnValue(Promise.resolve([]))
  wordService.findAll.mockReturnValue(Promise.resolve([]))
})

describe('Project pages', () => {
  it('displays CAIC page', async () => {
    await renderProjectPage(CAICHome, ResearchProjects.CAIC)
    expect(container).toMatchSnapshot()
  })
  it('displays aluGeneva page', async () => {
    await renderProjectPage(AluGenevaHome, ResearchProjects.aluGeneva)
    expect(container).toMatchSnapshot()
  })
  it('displays AMPS page', async () => {
    await renderProjectPage(AmpsHome, ResearchProjects.AMPS)
    expect(container).toMatchSnapshot()
  })
  it('displays RECC page', async () => {
    await renderProjectPage(ReccHome, ResearchProjects.RECC)
    expect(container).toMatchSnapshot()
  })
})

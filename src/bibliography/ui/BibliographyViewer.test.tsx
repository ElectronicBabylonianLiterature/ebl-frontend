import { createMemoryHistory } from 'history'
import { matchPath } from 'react-router-dom'
import { MemoryRouter, match } from 'react-router'
import { render, screen, fireEvent, act } from '@testing-library/react'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyViewer from './BibliographyViewer'
import Citation from 'bibliography/domain/Citation'
import Promise from 'bluebird'
import React from 'react'
import Reference from 'bibliography/domain/Reference'
import SessionContext from 'auth/SessionContext'

const entryId = 'RN1000'
let entry: BibliographyEntry
let bibliographyService: { find: jest.Mock }
let history

beforeEach(() => {
  entry = new BibliographyEntry({
    id: entryId,
    type: 'article-journal',
    title: 'Test Article',
    author: [{ given: 'John', family: 'Doe' }],
    issued: { 'date-parts': [['2023']] },
  })
  bibliographyService = { find: jest.fn() }
  history = createMemoryHistory({
    initialEntries: [`/bibliography/references/${entryId}`],
  })
  bibliographyService.find.mockReturnValue(Promise.resolve(entry))

  // Spy on history.push
  jest.spyOn(history, 'push')
})

describe('Bibliography Viewer', () => {
  test('Queries the entry from API', async () => {
    await renderViewer()
    expect(bibliographyService.find).toHaveBeenCalledWith(entryId)
  })

  test('Displays citation title', async () => {
    await renderViewer()
    const citationText = Citation.for(
      new Reference('DISCUSSION', '', '', [], entry)
    ).getMarkdown()
    expect(await screen.findByText(citationText)).toBeInTheDocument()
  })

  test('Displays full reference', async () => {
    await renderViewer()
    expect(await screen.findByText('Test Article')).toBeInTheDocument()
  })

  test('Navigates to edit page on Edit button click', async () => {
    await renderViewer()
    await act(async () => {
      fireEvent.click(await screen.findByText('Edit'))
    })
    expect(history.push).toHaveBeenCalledWith(
      `/bibliography/references/${entryId}/edit`
    )
  })

  async function renderViewer() {
    const matchedPath = matchPath(`/bibliography/references/${entryId}`, {
      path: '/bibliography/references/:id',
    }) as match<{ id: string }>
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/bibliography/references/${entryId}`]}>
          <SessionContext.Provider
            value={{ isAllowedToWriteBibliography: () => true }}
          >
            <BibliographyViewer
              match={matchedPath}
              bibliographyService={bibliographyService}
              history={history}
            />
          </SessionContext.Provider>
        </MemoryRouter>
      )
    })
    await screen.findByText('Test Article')
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })
})

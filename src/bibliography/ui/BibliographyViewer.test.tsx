import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, match } from 'react-router'
import { matchPath } from 'react-router-dom'
import Promise from 'bluebird'
import BibliographyViewer from './BibliographyViewer'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { createMemoryHistory } from 'history'
import Citation from 'bibliography/domain/Citation'
import Reference from 'bibliography/domain/Reference'

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
  history = createMemoryHistory()
  bibliographyService.find.mockReturnValue(Promise.resolve(entry))
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
    expect(history.location.pathname).toBe(
      `/bibliography/references/${entryId}/edit`
    )
  })

  test('Renders download buttons', async () => {
    await renderViewer()
    expect(await screen.findByText('BibTeX')).toBeInTheDocument()
    expect(await screen.findByText('CSL-JSON')).toBeInTheDocument()
    expect(await screen.findByText('RIS')).toBeInTheDocument()
  })

  async function renderViewer() {
    const matchedPath = matchPath(`/bibliography/references/${entryId}`, {
      path: '/bibliography/references/:id',
    }) as match<{ id: string }>
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/bibliography/references/${entryId}`]}>
          <BibliographyViewer
            match={matchedPath}
            bibliographyService={bibliographyService}
            history={history}
          />
        </MemoryRouter>
      )
    })
    await screen.findByText('Test Article')
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })
})

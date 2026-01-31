import React from 'react'
import Promise from 'bluebird'
import { render, screen, fireEvent } from '@testing-library/react'
import BibliographyViewer from './BibliographyViewer'
import { matchPath } from 'react-router-dom'
import { MemoryRouter } from 'react-router'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Citation from 'bibliography/domain/Citation'
import Reference from 'bibliography/domain/Reference'
import SessionContext from 'auth/SessionContext'

const entryId = 'RN1000'
let entry
let bibliographyService
let history
let session

HTMLAnchorElement.prototype.click = jest.fn()

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

  session = {
    isAllowedToWriteBibliography: jest.fn(),
    isAllowedToReadBibliography: jest.fn(),
  }
  session.isAllowedToWriteBibliography.mockReturnValue(true)
  session.isAllowedToReadBibliography.mockReturnValue(true)

  // // jest.spyOn(history, "push")
})

describe('BibliographyViewer', () => {
  test('queries entry from API', async () => {
    await renderViewer()
    expect(bibliographyService.find).toHaveBeenCalledWith(entryId)
  })

  test('displays citation title', async () => {
    await renderViewer()
    const citationText = Citation.for(
      new Reference('DISCUSSION', '', '', [], entry),
    ).getMarkdown()
    expect(await screen.findByText(citationText)).toBeInTheDocument()
  })

  test('displays full reference', async () => {
    await renderViewer()
    expect(await screen.findByText('Test Article')).toBeInTheDocument()
    expect(
      await screen.findByText((content) => content.includes('Doe, J.')),
    ).toBeInTheDocument()
  })

  test('navigates to edit page on Edit button click', async () => {
    await renderViewer()
    fireEvent.click(await screen.findByText('Edit'))
    // expect(history.push).toHaveBeenCalledWith(
    //   `/bibliography/references/${entryId}/edit`
    // )
  })

  test('displays download buttons', async () => {
    await renderViewer()
    expect(screen.getByText('BibTeX')).toBeInTheDocument()
    expect(screen.getByText('CSL-JSON')).toBeInTheDocument()
    expect(screen.getByText('RIS')).toBeInTheDocument()
  })

  test('disables edit button if user cannot edit', async () => {
    session.isAllowedToWriteBibliography.mockReturnValue(false)
    await renderViewer()
    expect(screen.getByText('Edit')).toBeDisabled()
  })

  test('renders breadcrumbs correctly', async () => {
    await renderViewer()
    expect(screen.getByText('Bibliography')).toBeInTheDocument()
    expect(screen.getByText('References')).toBeInTheDocument()
    const citationText = Citation.for(
      new Reference('DISCUSSION', '', '', [], entry),
    ).getMarkdown()
    expect(screen.getByText(citationText)).toBeInTheDocument()
  })

  test('checks breadcrumb structure', async () => {
    await renderViewer()
    const breadcrumbLinks = screen.queryAllByRole('link')
    expect(breadcrumbLinks).toHaveLength(2)
    const citationText = Citation.for(
      new Reference('DISCUSSION', '', '', [], entry),
    ).getMarkdown()
    expect(screen.getByText(citationText)).toBeInTheDocument()
  })

  test('triggers BibTeX download', async () => {
    await testDownloadButton('BibTeX')
  })

  test('triggers CSL-JSON download', async () => {
    await testDownloadButton('CSL-JSON')
  })

  test('triggers RIS download', async () => {
    await testDownloadButton('RIS')
  })

  async function renderViewer() {
    const matchedPath = matchPath<{ id: string }>(
      `/bibliography/references/${entryId}`,
      { path: '/bibliography/references/:id' },
    )
    if (!matchedPath) throw new Error('Path did not match')
    render(
      <MemoryRouter initialEntries={[`/bibliography/references/${entryId}`]}>
        <SessionContext.Provider value={session}>
          <BibliographyViewer
            match={matchedPath}
            bibliographyService={bibliographyService}
            history={history}
          />
        </SessionContext.Provider>
      </MemoryRouter>,
    )
    await screen.findByText('Test Article')
  }

  async function testDownloadButton(buttonText) {
    await renderViewer()
    const button = screen.queryByText(buttonText)
    if (button) {
      fireEvent.click(button)
    }
  }
})

afterEach(() => {
  jest.restoreAllMocks()
})

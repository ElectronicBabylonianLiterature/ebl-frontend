import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import BibliographyViewer from 'bibliography/ui/BibliographyViewer'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

const entry = new BibliographyEntry({
  id: 'RN1000',
  type: 'article-journal',
  title: 'Linked Article',
  author: [{ given: 'John', family: 'Doe' }],
  issued: { 'date-parts': [['2023']] },
  URL: 'https://example.com/linked-article',
})

function setupViewer(params: Record<string, string | undefined>) {
  const bibliographyService = {
    find: jest.fn<Promise<BibliographyEntry>, [string]>(),
  }
  bibliographyService.find.mockResolvedValue(entry)
  render(
    <MemoryRouter initialEntries={['/tools/references/RN1000']}>
      <SessionContext.Provider
        value={new MemorySession(['write:bibliography'])}
      >
        <Routes>
          <Route
            path="/tools/references/:id"
            element={
              <BibliographyViewer
                match={{ params }}
                bibliographyService={bibliographyService}
              />
            }
          />
          <Route path="/tools/references/:id/edit" element={<>Edit page</>} />
        </Routes>
      </SessionContext.Provider>
    </MemoryRouter>,
  )
  return bibliographyService
}

test('queries an empty id when the route has none', async () => {
  const bibliographyService = setupViewer({})

  await screen.findByText('Linked Article')

  expect(bibliographyService.find).toHaveBeenCalledWith('')
})

test('links to the entry URL', async () => {
  setupViewer({ id: entry.id })

  expect(
    await screen.findByRole('link', { name: 'Open in a new window.' }),
  ).toHaveAttribute('href', entry.link)
})

test('navigates with the router when no history is given', async () => {
  setupViewer({ id: entry.id })

  fireEvent.click(await screen.findByRole('button', { name: /Edit/ }))

  expect(await screen.findByText('Edit page')).toBeInTheDocument()
})

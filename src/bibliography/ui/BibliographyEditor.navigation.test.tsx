import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, render, screen } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { submitForm } from 'test-support/utils'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import BibliographyEntry, {
  template,
} from 'bibliography/domain/BibliographyEntry'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { referencesEntryRoute } from 'bibliography/ui/referencesRouteContext'

const entry = bibliographyEntryFactory.build({}, { transient: { id: 'RN7' } })

function createBibliographyService() {
  return {
    find: jest.fn<Promise<BibliographyEntry>, [string]>(),
    create: jest.fn<Promise<BibliographyEntry>, [BibliographyEntry]>(),
    update: jest.fn<Promise<BibliographyEntry>, [BibliographyEntry]>(),
  }
}

function renderEditor(element: React.ReactElement): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <SessionContext.Provider
        value={new MemorySession(['write:bibliography'])}
      >
        {element}
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

test('edits by default and queries an empty id when the route has none', async () => {
  const bibliographyService = createBibliographyService()
  bibliographyService.find.mockResolvedValue(entry)

  renderEditor(
    <BibliographyEditor
      match={{ params: {} }}
      bibliographyService={bibliographyService}
    />,
  )

  expect(await screen.findByText('View')).toBeInTheDocument()
  expect(bibliographyService.find).toHaveBeenCalledWith('')
})

test('View pushes the entry route to the given history', async () => {
  const bibliographyService = createBibliographyService()
  bibliographyService.find.mockResolvedValue(entry)
  const history = { push: jest.fn<void, [string]>() }

  renderEditor(
    <BibliographyEditor
      match={{ params: { id: entry.id } }}
      bibliographyService={bibliographyService}
      history={history}
    />,
  )
  const viewButton = await screen.findByText('View')
  act(() => viewButton.click())

  expect(history.push).toHaveBeenCalledWith(referencesEntryRoute(entry.id))
})

test('creating pushes the created entry route to the given history', async () => {
  const bibliographyService = createBibliographyService()
  bibliographyService.create.mockResolvedValue(template)
  const history = { push: jest.fn<void, [string]>() }

  const { container } = renderEditor(
    <BibliographyEditor
      match={{ params: { id: '' } }}
      bibliographyService={bibliographyService}
      history={history}
      create
    />,
  )
  await screen.findByText('Create')
  await submitForm(container)

  expect(bibliographyService.create).toHaveBeenCalledWith(template)
  expect(history.push).toHaveBeenCalledWith(referencesEntryRoute(template.id))
})

import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { produce } from 'immer'
import TextService from 'corpus/application/TextService'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  buildManuscripts,
  createManuscriptsContext,
  createManuscriptsElement,
  firstSiglum,
  ManuscriptsContext,
  manuscriptsProvenanceRecords,
  ManuscriptsServices,
  manuscriptsUncertainFragments,
  openManuscript,
  renderLoadedManuscripts,
  setUpManuscriptsProvenances,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import { createDeferred } from 'corpus/ui/edit-lite/useEditLite.testSupport'
import FragmentService from 'fragmentarium/application/FragmentService'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')

const services: ManuscriptsServices = {
  textService: new (TextService as jest.Mock<jest.Mocked<TextService>>)(),
  fragmentService: new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)(),
  searchBibliography: jest.fn(),
}

function buildEditedManuscripts(): Manuscript[] {
  return produce(buildManuscripts(), (draft) => {
    draft[0].notes = 'first note!'
  })
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Save manuscripts' })
}

function createSavingContext(): ManuscriptsContext {
  return createManuscriptsContext()
}

async function renderEdited(context: ManuscriptsContext): Promise<void> {
  await renderLoadedManuscripts(services, { context })
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
}

setUpManuscriptsProvenances()

beforeEach(() => {
  services.textService.findManuscripts.mockResolvedValue(buildManuscripts())
  services.fragmentService.fetchProvenances.mockResolvedValue(
    manuscriptsProvenanceRecords,
  )
  services.searchBibliography.mockResolvedValue([])
})

test('there is nothing to save before something was edited', async () => {
  const context = createSavingContext()
  await renderLoadedManuscripts(services, { context })

  expect(saveButton()).toBeDisabled()
  expect(context.actions.reportUnsavedManuscripts.mock.calls).toEqual([[false]])
})

test('Save manuscripts sends the edited manuscripts and the fragments', async () => {
  const context = createSavingContext()
  const saved = createDeferred<void>()
  context.actions.saveManuscripts.mockReturnValueOnce(saved.promise)
  await renderEdited(context)
  await userEvent.click(saveButton())

  expect(context.actions.saveManuscripts.mock.calls).toEqual([
    [buildEditedManuscripts(), manuscriptsUncertainFragments],
  ])
  expect(screen.getByText('Saving...')).toBeVisible()
  expect(saveButton()).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Add manuscript' })).toBeDisabled()
  expect(screen.getByLabelText('Notes')).toBeDisabled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await act(async () => saved.resolve())

  expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Notes')).toBeEnabled()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('a rejected save shows the reason next to the manuscripts and keeps the edits', async () => {
  const context = createSavingContext()
  context.actions.saveManuscripts.mockRejectedValueOnce(
    new Error('Duplicate sigla: NinNA1a'),
  )
  await renderEdited(context)
  await userEvent.click(saveButton())

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Duplicate sigla: NinNA1a',
  )
  expect(screen.getByLabelText('Notes')).toHaveValue('first note!')
  expect(screen.getByText('2 manuscripts, 1 edited')).toBeVisible()
  expect(saveButton()).toBeEnabled()

  await userEvent.click(saveButton())

  expect(context.actions.saveManuscripts).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('reports whether the manuscripts have unsaved edits', async () => {
  const context = createSavingContext()
  const report = context.actions.reportUnsavedManuscripts
  await renderEdited(context)

  expect(report.mock.calls).toEqual([[false], [true]])

  await userEvent.type(screen.getByLabelText('Notes'), '{Backspace}')

  expect(report.mock.calls).toEqual([[false], [true], [false]])
})

test('reports no unsaved edits once it is gone', async () => {
  const context = createSavingContext()
  const view = await renderLoadedManuscripts(services, { context })
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  view.unmount()

  expect(context.actions.reportUnsavedManuscripts).toHaveBeenLastCalledWith(
    false,
  )
})

test('loads the saved manuscripts and fragments when the version changes', async () => {
  const context = createSavingContext()
  const view = await renderLoadedManuscripts(services, { context })
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  services.textService.findManuscripts.mockResolvedValue(
    buildEditedManuscripts(),
  )
  view.rerender(
    createManuscriptsElement(services, {
      context,
      version: 1,
      uncertainFragments: ['K.1', 'BM.2'],
    }),
  )

  expect(await screen.findByText('2 manuscripts')).toBeVisible()
  expect(services.textService.findManuscripts).toHaveBeenCalledTimes(2)
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
  expect(saveButton()).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Edit uncertain fragment BM.2' }),
  ).toBeVisible()

  const reloaded = within(await openManuscript(firstSiglum))

  expect(reloaded.getByLabelText('Notes')).toHaveValue('first note!')
})

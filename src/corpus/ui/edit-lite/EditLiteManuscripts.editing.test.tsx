import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TextService from 'corpus/application/TextService'
import {
  buildManuscripts,
  createManuscriptsContext,
  createManuscriptsElement,
  editorName,
  firstSiglum,
  manuscriptsProvenanceRecords,
  ManuscriptsServices,
  manuscriptsUncertainFragments,
  openManuscript,
  openPreview,
  queryEditor,
  renderLoadedManuscripts,
  secondSiglum,
  setUpManuscriptsProvenances,
  toggleOf,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
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
const newSiglum = 'NinNA'

function newToggle(): HTMLElement {
  return screen.getByRole('button', { name: /^NinNA —/ })
}

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

async function previewedBody(): Promise<{
  manuscripts: { id: number; notes: string }[]
  uncertainFragments: string[]
}> {
  const dialog = within(await openPreview())
  return JSON.parse(dialog.getByLabelText('Request body').textContent ?? '')
}

setUpManuscriptsProvenances()

beforeEach(() => {
  services.textService.findManuscripts.mockResolvedValue(buildManuscripts())
  services.fragmentService.fetchProvenances.mockResolvedValue(
    manuscriptsProvenanceRecords,
  )
  services.searchBibliography.mockResolvedValue([])
})

test('Add manuscript appends an open row with the next free id', async () => {
  await renderLoadedManuscripts(services)
  await userEvent.click(button('Add manuscript'))
  const editor = screen.getByRole('group', { name: editorName(newSiglum) })

  expect(screen.getByText('3 manuscripts, 1 new')).toBeVisible()
  expect(within(newToggle()).getByText('new')).toBeVisible()
  expect(newToggle()).toHaveAttribute('aria-expanded', 'true')
  expect(within(editor).getByLabelText('Museum Number')).toHaveValue('')
  expect(queryEditor(firstSiglum)).not.toBeInTheDocument()
  expect((await previewedBody()).manuscripts.map(({ id }) => id)).toEqual([
    1, 2, 3,
  ])
})

test('the first manuscript of a chapter can be added', async () => {
  services.textService.findManuscripts.mockResolvedValue([])
  render(createManuscriptsElement(services, { uncertainFragments: [] }))
  await userEvent.click(
    await screen.findByRole('button', { name: 'Add manuscript' }),
  )

  expect(screen.getByText('1 manuscript, 1 new')).toBeVisible()
  expect(
    screen.queryByText('This chapter has no manuscripts.'),
  ).not.toBeInTheDocument()
  expect((await previewedBody()).manuscripts.map(({ id }) => id)).toEqual([1])
})

test('Delete manuscript removes the row and keeps the other rows as they were', async () => {
  await renderLoadedManuscripts(services)
  const second = within(await openManuscript(secondSiglum))
  await userEvent.type(second.getByLabelText('Notes'), '!')
  const first = within(await openManuscript(firstSiglum))
  await userEvent.click(
    first.getByRole('button', { name: 'Delete manuscript' }),
  )

  expect(screen.getByText('1 manuscript, 1 edited, 1 deleted')).toBeVisible()
  expect(
    screen.queryByRole('button', { name: new RegExp(`^${firstSiglum}`) }),
  ).not.toBeInTheDocument()
  expect(toggleOf(secondSiglum)).toHaveAttribute('aria-expanded', 'true')
  expect(
    within(
      screen.getByRole('group', { name: editorName(secondSiglum) }),
    ).getByLabelText('Notes'),
  ).toHaveValue('!')
  expect(await previewedBody()).toMatchObject({
    manuscripts: [{ id: 2, notes: '!' }],
    uncertainFragments: manuscriptsUncertainFragments,
  })
})

test('deleting the last manuscript shows the empty chapter', async () => {
  services.textService.findManuscripts.mockResolvedValue(
    buildManuscripts().slice(0, 1),
  )
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.click(
    editor.getByRole('button', { name: 'Delete manuscript' }),
  )

  expect(screen.getByText('This chapter has no manuscripts.')).toBeVisible()
  expect(screen.getByText('0 manuscripts, 1 deleted')).toBeVisible()
  expect(button('Save manuscripts')).toBeEnabled()
})

test('the uncertain fragments are edited with the manuscripts', async () => {
  await renderLoadedManuscripts(services)

  expect(button('Save manuscripts')).toBeDisabled()

  await userEvent.click(button('Add fragment'))
  await userEvent.keyboard('BM.2')

  expect(button('Save manuscripts')).toBeEnabled()
  expect((await previewedBody()).uncertainFragments).toEqual(['K.1', 'BM.2'])
})

test('a reader can open a manuscript but not change anything', async () => {
  const context = createManuscriptsContext({ canWrite: false })
  await renderLoadedManuscripts(services, { context })
  const editor = within(await openManuscript(firstSiglum))

  expect(editor.getByLabelText('Museum Number')).toHaveValue('K.5419.C')
  expect(editor.getByLabelText('Museum Number')).toBeDisabled()
  expect(editor.getByLabelText('Notes')).toBeDisabled()
  expect(editor.getByLabelText('Provenance')).toBeDisabled()
  expect(editor.getByLabelText(/^colophon-editor-/)).toBeDisabled()
  expect(
    editor.queryByRole('button', { name: 'Delete manuscript' }),
  ).not.toBeInTheDocument()
  expect(context.actions.reportUnsavedManuscripts).not.toHaveBeenCalledWith(
    true,
  )
})

test('a reader gets no control that edits or previews the manuscripts', async () => {
  await renderLoadedManuscripts(services, {
    context: createManuscriptsContext({ canWrite: false }),
  })

  expect(screen.getByText('2 manuscripts')).toBeVisible()
  expect(screen.getByText('K.1')).toBeVisible()
  expect(
    screen.getAllByRole('button').map((control) => control.textContent),
  ).toEqual([
    expect.stringContaining(firstSiglum),
    expect.stringContaining(secondSiglum),
  ])
  expect(screen.queryByText(/nothing is sent/)).not.toBeInTheDocument()
})

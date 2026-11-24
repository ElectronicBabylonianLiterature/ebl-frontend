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
  ManuscriptsContext,
  ManuscriptsServices,
  manuscriptsUncertainFragments,
  openManuscript,
  queryEditor,
  renderLoadedManuscripts,
  saveManuscripts,
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

async function savedIds(
  context: ManuscriptsContext,
): Promise<(number | null)[]> {
  const [manuscripts] = await saveManuscripts(context)
  return manuscripts.map(({ id }) => id)
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
  const context = createManuscriptsContext()
  await renderLoadedManuscripts(services, { context })
  await userEvent.click(button('Add manuscript'))
  const editor = screen.getByRole('group', { name: editorName(newSiglum) })

  expect(screen.getByText('3 manuscripts, 1 new')).toBeVisible()
  expect(within(newToggle()).getByText('new')).toBeVisible()
  expect(newToggle()).toHaveAttribute('aria-expanded', 'true')
  expect(within(editor).getByLabelText('Museum Number')).toHaveValue('')
  expect(queryEditor(firstSiglum)).not.toBeInTheDocument()
  expect(await savedIds(context)).toEqual([1, 2, 3])
})

test('the first manuscript of a chapter can be added', async () => {
  const context = createManuscriptsContext()
  services.textService.findManuscripts.mockResolvedValue([])
  render(
    createManuscriptsElement(services, { context, uncertainFragments: [] }),
  )
  await userEvent.click(
    await screen.findByRole('button', { name: 'Add manuscript' }),
  )

  expect(screen.getByText('1 manuscript, 1 new')).toBeVisible()
  expect(
    screen.queryByText('This chapter has no manuscripts.'),
  ).not.toBeInTheDocument()
  expect(await savedIds(context)).toEqual([1])
})

test('Delete manuscript removes the row and keeps the other rows as they were', async () => {
  const context = createManuscriptsContext()
  await renderLoadedManuscripts(services, { context })
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
  const [manuscripts, uncertainFragments] = await saveManuscripts(context)

  expect(manuscripts).toMatchObject([{ id: 2, notes: '!' }])
  expect(uncertainFragments).toEqual(manuscriptsUncertainFragments)
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
  const context = createManuscriptsContext()
  await renderLoadedManuscripts(services, { context })

  expect(button('Save manuscripts')).toBeDisabled()

  await userEvent.click(button('Add fragment'))
  await userEvent.keyboard('BM.2')

  expect(button('Save manuscripts')).toBeEnabled()
  expect((await saveManuscripts(context))[1]).toEqual(['K.1', 'BM.2'])
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

test('a reader gets no control that edits the manuscripts', async () => {
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
})

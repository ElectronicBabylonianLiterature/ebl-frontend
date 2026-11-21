import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import TextService from 'corpus/application/TextService'
import {
  buildManuscripts,
  calledMethodNames,
  createManuscriptsElement,
  firstSiglum,
  manuscriptsChapterId,
  manuscriptsProvenanceRecords,
  ManuscriptsServices,
  openManuscript,
  queryEditor,
  renderLoadedManuscripts,
  secondSiglum,
  setUpManuscriptsProvenances,
  toggleOf,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ChapterId } from 'transliteration/domain/chapter-id'

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

setUpManuscriptsProvenances()

beforeEach(() => {
  services.textService.findManuscripts.mockResolvedValue(buildManuscripts())
  services.fragmentService.fetchProvenances.mockResolvedValue(
    manuscriptsProvenanceRecords,
  )
  services.searchBibliography.mockResolvedValue([])
})

test('shows a spinner until the manuscripts are loaded', async () => {
  render(createManuscriptsElement(services))

  expect(screen.getByLabelText('Spinner')).toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()

  await screen.findByRole('list', { name: 'Manuscripts' })

  expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
  expect(services.textService.findManuscripts).toHaveBeenCalledWith(
    manuscriptsChapterId,
    expect.any(AbortSignal),
  )
  expect(services.fragmentService.fetchProvenances).toHaveBeenCalledTimes(1)
})

test('lists one collapsed row per manuscript', async () => {
  await renderLoadedManuscripts(services)
  const first = within(toggleOf(firstSiglum))
  const second = within(toggleOf(secondSiglum))

  expect(screen.getByText('2 manuscripts')).toBeVisible()
  expect(toggleOf(firstSiglum)).toHaveAttribute('aria-expanded', 'false')
  expect(first.getByText('K.5419.C')).toBeVisible()
  expect(first.getByText('Neo-Assyrian')).toBeVisible()
  expect(first.getByText('Nineveh')).toBeVisible()
  expect(first.getByText('Library')).toBeVisible()
  expect(second.getByText('A.33')).toBeVisible()
  expect(second.getByText('Late Neo-Babylonian')).toBeVisible()
  expect(second.getByText('Babylon')).toBeVisible()
  expect(second.getByText('School')).toBeVisible()
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('renders no form control before a row is opened', async () => {
  await renderLoadedManuscripts(services)

  expect(queryEditor(firstSiglum)).not.toBeInTheDocument()
  expect(queryEditor(secondSiglum)).not.toBeInTheDocument()
  expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  expect(screen.queryAllByRole('combobox')).toHaveLength(0)
  expect(screen.queryByLabelText('Museum Number')).not.toBeInTheDocument()
})

test('opening a row mounts the form of that manuscript only', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))

  expect(toggleOf(firstSiglum)).toHaveAttribute('aria-expanded', 'true')
  expect(toggleOf(secondSiglum)).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getAllByLabelText('Museum Number')).toHaveLength(1)
  expect(editor.getByLabelText('Museum Number')).toHaveValue('K.5419.C')
  expect(editor.getByLabelText('Notes')).toHaveValue('first note')
  expect(editor.getByLabelText(/^colophon-editor-/)).toHaveValue('')
  expect(queryEditor(secondSiglum)).not.toBeInTheDocument()
})

test('offers the provenances of the fragment service in tree order', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  const provenance = editor.getByLabelText('Provenance')

  expect(provenance).toHaveValue('Nineveh')
  expect(
    within(provenance)
      .getAllByRole('option')
      .map((option) => option.textContent?.trim()),
  ).toEqual(['Assyria', 'Nineveh', 'Babylonia', 'Babylon'])
})

test('several rows can be open at once', async () => {
  await renderLoadedManuscripts(services)
  await openManuscript(firstSiglum)
  await openManuscript(secondSiglum)

  expect(queryEditor(firstSiglum)).toBeVisible()
  expect(queryEditor(secondSiglum)).toBeVisible()
  expect(screen.getAllByLabelText('Museum Number')).toHaveLength(2)
})

test('editing a field marks only that row as edited', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')

  expect(editor.getByLabelText('Notes')).toHaveValue('first note!')
  expect(within(toggleOf(firstSiglum)).getByText('edited')).toBeVisible()
  expect(
    within(toggleOf(secondSiglum)).queryByText('edited'),
  ).not.toBeInTheDocument()
  expect(screen.getByText('2 manuscripts, 1 edited')).toBeVisible()
})

test('undoing an edit removes the edited mark', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!{Backspace}')

  expect(editor.getByLabelText('Notes')).toHaveValue('first note')
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
  expect(screen.getByText('2 manuscripts')).toBeVisible()
})

test('the collapsed row follows the edited manuscript', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.selectOptions(editor.getByLabelText('Provenance'), 'Babylon')
  fireEvent.change(editor.getByLabelText('Museum Number'), {
    target: { value: 'BM.1' },
  })

  expect(within(toggleOf('BabNA1a')).getByText('BM.1')).toBeVisible()
  expect(within(toggleOf('BabNA1a')).getByText('Babylon')).toBeVisible()
  expect(queryEditor('BabNA1a')).toBeVisible()
})

test('closing a row unmounts the form and keeps the edit', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  await userEvent.click(toggleOf(firstSiglum))

  expect(toggleOf(firstSiglum)).toHaveAttribute('aria-expanded', 'false')
  expect(queryEditor(firstSiglum)).not.toBeInTheDocument()
  expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  expect(within(toggleOf(firstSiglum)).getByText('edited')).toBeVisible()

  const reopened = within(await openManuscript(firstSiglum))

  expect(reopened.getByLabelText('Notes')).toHaveValue('first note!')
})

test('never calls anything but the two reads', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  await userEvent.click(screen.getByRole('button', { name: 'Preview request' }))

  expect(calledMethodNames(services.textService)).toEqual(['findManuscripts'])
  expect(calledMethodNames(services.fragmentService)).toEqual([
    'fetchProvenances',
  ])
  expect(services.textService.findManuscripts).toHaveBeenCalledTimes(1)
  expect(fetchMock).not.toHaveBeenCalled()
})

test('aborts the read when it is unmounted', async () => {
  const view = await renderLoadedManuscripts(services)
  const signal = services.textService.findManuscripts.mock.calls[0][1]
  view.unmount()

  expect(signal?.aborted).toBe(true)
})

test('loads again and drops the edits when the chapter changes', async () => {
  const otherId: ChapterId = { ...manuscriptsChapterId, name: 'II' }
  const view = await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  view.rerender(createManuscriptsElement(services, otherId))
  await screen.findByText('2 manuscripts')

  expect(services.textService.findManuscripts).toHaveBeenLastCalledWith(
    otherId,
    expect.any(AbortSignal),
  )
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
  expect(queryEditor(firstSiglum)).not.toBeInTheDocument()
})

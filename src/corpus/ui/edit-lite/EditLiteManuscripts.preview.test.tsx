import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { produce } from 'immer'
import { toManuscriptsDto } from 'corpus/application/chapterDtoSerialization'
import TextService from 'corpus/application/TextService'
import { Manuscript } from 'corpus/domain/manuscript'
import { manuscriptsPreviewNotice } from 'corpus/ui/edit-lite/EditLiteManuscriptPreview'
import {
  createManuscriptsTarget,
  manuscriptsNotice,
} from 'corpus/ui/edit-lite/EditLiteManuscripts'
import {
  buildManuscripts,
  createManuscriptsElement,
  firstSiglum,
  manuscriptsChapterId,
  manuscriptsProvenanceRecords,
  ManuscriptsServices,
  manuscriptsUncertainFragments,
  openManuscript,
  openPreview,
  renderLoadedManuscripts,
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
const target = 'POST /texts/L/1/2/chapters/Standard%20Babylonian/I/manuscripts'

function requestBody(manuscripts: readonly Manuscript[]): string {
  return JSON.stringify(
    toManuscriptsDto(manuscripts, manuscriptsUncertainFragments),
    null,
    2,
  )
}

setUpManuscriptsProvenances()

beforeEach(() => {
  services.textService.findManuscripts.mockResolvedValue(buildManuscripts())
  services.fragmentService.fetchProvenances.mockResolvedValue(
    manuscriptsProvenanceRecords,
  )
  services.searchBibliography.mockResolvedValue([])
})

test('states that edits are not sent', async () => {
  await renderLoadedManuscripts(services)

  expect(screen.getByText(manuscriptsNotice)).toBeVisible()
  expect(manuscriptsNotice).toContain('nothing is sent')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('previews the request of the unchanged manuscripts', async () => {
  await renderLoadedManuscripts(services)
  const dialog = within(await openPreview())

  expect(createManuscriptsTarget(manuscriptsChapterId)).toBe(target)
  expect(dialog.getByText(target)).toBeVisible()
  expect(dialog.getByText(manuscriptsPreviewNotice)).toBeVisible()
  expect(manuscriptsPreviewNotice).toContain('nothing was sent')
  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    requestBody(buildManuscripts()),
    { normalizeWhitespace: false },
  )
  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    '\n  "uncertainFragments": [\n    "K.1"\n  ]\n}',
    { normalizeWhitespace: false },
  )
})

test('previews the edited manuscripts', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  fireEvent.change(editor.getByLabelText(/^colophon-editor-/), {
    target: { value: '1. kur' },
  })
  const dialog = within(await openPreview())
  const body = dialog.getByLabelText('Request body')

  expect(body).toHaveTextContent(
    requestBody(
      produce(buildManuscripts(), (draft) => {
        draft[0].notes = 'first note!'
        draft[0].colophon = '1. kur'
      }),
    ),
    { normalizeWhitespace: false },
  )
  expect(body).toHaveTextContent('"notes": "first note!"')
  expect(body).toHaveTextContent('"colophon": "1. kur"')
  expect(body).toHaveTextContent('"provenance": "Nineveh"')
})

test('previews an edit of a row that was closed again', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  await userEvent.click(toggleOf(firstSiglum))
  const dialog = within(await openPreview())

  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    '"notes": "first note!"',
  )
})

test('closing the preview keeps the edits', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  const dialog = within(await openPreview())
  await userEvent.click(dialog.getByText('Close', { selector: 'button' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(editor.getByLabelText('Notes')).toHaveValue('first note!')
  expect(screen.getByText('2 manuscripts, 1 edited')).toBeVisible()
})

test('shows an empty chapter and still previews its request', async () => {
  services.textService.findManuscripts.mockResolvedValue([])
  render(createManuscriptsElement(services))

  expect(
    await screen.findByText('This chapter has no manuscripts.'),
  ).toBeVisible()
  expect(screen.getByText('0 manuscripts')).toBeVisible()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()

  const dialog = within(await openPreview())

  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    requestBody([]),
    { normalizeWhitespace: false },
  )
})

test.each([
  [
    'manuscripts',
    (): void => {
      services.textService.findManuscripts.mockRejectedValue(
        new Error('The manuscripts are gone.'),
      )
    },
    'The manuscripts are gone.',
  ],
  [
    'provenances',
    (): void => {
      services.fragmentService.fetchProvenances.mockRejectedValue(
        new Error('The provenances are gone.'),
      )
    },
    'The provenances are gone.',
  ],
])(
  'shows the error when loading the %s fails',
  async (_name, failRead, message) => {
    failRead()
    render(createManuscriptsElement(services))

    expect(await screen.findByText(message)).toBeVisible()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Preview request' }),
    ).not.toBeInTheDocument()
  },
)

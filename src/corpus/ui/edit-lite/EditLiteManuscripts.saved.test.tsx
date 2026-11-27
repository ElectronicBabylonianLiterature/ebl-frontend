import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { produce } from 'immer'
import TextService from 'corpus/application/TextService'
import {
  buildManuscripts,
  createManuscriptsContext,
  createManuscriptsElement,
  firstSiglum,
  manuscriptsProvenanceRecords,
  ManuscriptsServices,
  manuscriptsUncertainFragments,
  openManuscript,
  renderLoadedManuscripts,
  saveManuscripts,
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

setUpManuscriptsProvenances()

beforeEach(() => {
  services.textService.findManuscripts.mockResolvedValue(buildManuscripts())
  services.fragmentService.fetchProvenances.mockResolvedValue(
    manuscriptsProvenanceRecords,
  )
  services.searchBibliography.mockResolvedValue([])
})

test('saves the edited manuscripts with every field', async () => {
  const context = createManuscriptsContext()
  await renderLoadedManuscripts(services, { context })
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  fireEvent.change(editor.getByLabelText(/^colophon-editor-/), {
    target: { value: '1. kur' },
  })
  const [manuscripts, uncertainFragments] = await saveManuscripts(context)

  expect(manuscripts).toEqual(
    produce(buildManuscripts(), (draft) => {
      draft[0].notes = 'first note!'
      draft[0].colophon = '1. kur'
    }),
  )
  expect(manuscripts[0].provenance.name).toBe('Nineveh')
  expect(uncertainFragments).toEqual(manuscriptsUncertainFragments)
})

test('saves an edit of a row that was closed again', async () => {
  const context = createManuscriptsContext()
  await renderLoadedManuscripts(services, { context })
  const editor = within(await openManuscript(firstSiglum))
  await userEvent.type(editor.getByLabelText('Notes'), '!')
  await userEvent.click(toggleOf(firstSiglum))
  const [manuscripts] = await saveManuscripts(context)

  expect(manuscripts[0].notes).toBe('first note!')
})

test('shows an empty chapter', async () => {
  services.textService.findManuscripts.mockResolvedValue([])
  render(createManuscriptsElement(services))

  expect(
    await screen.findByText('This chapter has no manuscripts.'),
  ).toBeVisible()
  expect(screen.getByText('0 manuscripts')).toBeVisible()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Save manuscripts' }),
  ).toBeDisabled()
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
      screen.queryByRole('button', { name: 'Save manuscripts' }),
    ).not.toBeInTheDocument()
  },
)

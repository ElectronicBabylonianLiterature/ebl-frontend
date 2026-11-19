import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import TextService from 'corpus/application/TextService'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  buildManuscripts,
  firstSiglum,
  manuscriptsProvenanceRecords,
  ManuscriptsServices,
  openManuscript,
  renderLoadedManuscripts,
  secondSiglum,
  setUpManuscriptsProvenances,
  toggleOf,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import * as manuscriptSummary from 'corpus/ui/edit-lite/EditLiteManuscriptSummary'
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
const manyManuscriptsCount = 300

function summarizedIds(
  summarizeManuscript: jest.SpyInstance<unknown, [Manuscript]>,
): (number | null)[] {
  return summarizeManuscript.mock.calls.map(([manuscript]) => manuscript.id)
}

setUpManuscriptsProvenances()

beforeEach(() => {
  services.textService.findManuscripts.mockResolvedValue(buildManuscripts())
  services.fragmentService.fetchProvenances.mockResolvedValue(
    manuscriptsProvenanceRecords,
  )
  services.searchBibliography.mockResolvedValue([])
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('renders every row once when the manuscripts are loaded', async () => {
  const summarizeManuscript = jest.spyOn(
    manuscriptSummary,
    'summarizeManuscript',
  )
  await renderLoadedManuscripts(services)

  expect(summarizedIds(summarizeManuscript)).toEqual([1, 2])
})

test('opening a row renders that row only', async () => {
  const summarizeManuscript = jest.spyOn(
    manuscriptSummary,
    'summarizeManuscript',
  )
  await renderLoadedManuscripts(services)
  summarizeManuscript.mockClear()
  await openManuscript(secondSiglum)

  expect(summarizedIds(summarizeManuscript)).toEqual([2])
})

test('typing in an open row renders that row only', async () => {
  const summarizeManuscript = jest.spyOn(
    manuscriptSummary,
    'summarizeManuscript',
  )
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))
  await openManuscript(secondSiglum)
  summarizeManuscript.mockClear()
  await userEvent.type(editor.getByLabelText('Notes'), 'ab')

  expect(summarizedIds(summarizeManuscript)).toEqual([1, 1])
})

test('opening the preview renders no row', async () => {
  const summarizeManuscript = jest.spyOn(
    manuscriptSummary,
    'summarizeManuscript',
  )
  await renderLoadedManuscripts(services)
  summarizeManuscript.mockClear()
  await userEvent.click(screen.getByRole('button', { name: 'Preview request' }))

  expect(screen.getByRole('dialog')).toBeVisible()
  expect(summarizeManuscript).not.toHaveBeenCalled()
})

test('a long chapter mounts a form for the opened row only', async () => {
  services.textService.findManuscripts.mockResolvedValue(
    _.range(manyManuscriptsCount).map(
      (index) =>
        new Manuscript({ id: index + 1, siglumDisambiguator: `${index + 1}x` }),
    ),
  )
  await renderLoadedManuscripts(services)

  expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(
    manyManuscriptsCount,
  )
  expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  expect(screen.queryAllByRole('combobox')).toHaveLength(0)

  await userEvent.click(toggleOf('NinNA250x'))

  expect(screen.getAllByLabelText('Museum Number')).toHaveLength(1)
  expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1)
})

import React from 'react'
import { act, screen, within } from '@testing-library/react'
import { produce } from 'immer'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import TextService from 'corpus/application/TextService'
import { Manuscript } from 'corpus/domain/manuscript'
import { Provenance } from 'corpus/domain/provenance'
import {
  buildManuscripts,
  createManuscriptsElement,
  firstSiglum,
  manuscriptsProvenanceRecords,
  ManuscriptsServices,
  openManuscript,
  renderLoadedManuscripts,
  setUpManuscriptsProvenances,
  toggleOf,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import FragmentService from 'fragmentarium/application/FragmentService'

interface FormProps {
  readonly manuscript: Manuscript
  readonly provenanceOptions: readonly Provenance[]
  readonly onChange: (manuscript: Manuscript) => void
  readonly searchBibliography: (
    query: string,
  ) => Promise<readonly BibliographyEntry[]>
}

const mockFormRenders: FormProps[] = []

jest.mock('corpus/ui/manuscripts/ManuscriptForm', () => ({
  __esModule: true,
  default: (props: FormProps): JSX.Element => {
    mockFormRenders.push(props)
    return <p>{`Form of ${props.manuscript.siglum}`}</p>
  },
}))
jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')

const services: ManuscriptsServices = {
  textService: new (TextService as jest.Mock<jest.Mocked<TextService>>)(),
  fragmentService: new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)(),
  searchBibliography: jest.fn(),
}

function lastFormProps(): FormProps {
  return mockFormRenders[mockFormRenders.length - 1]
}

setUpManuscriptsProvenances()

beforeEach(() => {
  mockFormRenders.splice(0)
  services.textService.findManuscripts.mockResolvedValue(buildManuscripts())
  services.fragmentService.fetchProvenances.mockResolvedValue(
    manuscriptsProvenanceRecords,
  )
  services.searchBibliography.mockResolvedValue([])
})

test('mounts no form while every row is closed', async () => {
  await renderLoadedManuscripts(services)

  expect(mockFormRenders).toHaveLength(0)
})

test('gives the form its manuscript and the sorted provenances', async () => {
  await renderLoadedManuscripts(services)
  const editor = within(await openManuscript(firstSiglum))

  expect(editor.getByText(`Form of ${firstSiglum}`)).toBeVisible()
  expect(mockFormRenders).toHaveLength(1)
  expect(lastFormProps().manuscript).toEqual(buildManuscripts()[0])
  expect(lastFormProps().provenanceOptions).toEqual([
    expect.objectContaining({ name: 'Assyria', parent: null }),
    expect.objectContaining({
      name: 'Nineveh',
      abbreviation: 'Nin',
      parent: 'Assyria',
    }),
    expect.objectContaining({ name: 'Babylonia', parent: null }),
    expect.objectContaining({
      name: 'Babylon',
      abbreviation: 'Bab',
      parent: 'Babylonia',
    }),
  ])
})

test('keeps a manuscript changed by the form', async () => {
  await renderLoadedManuscripts(services)
  await openManuscript(firstSiglum)
  const changed = produce(lastFormProps().manuscript, (draft) => {
    draft.siglumDisambiguator = '9'
  })
  act(() => lastFormProps().onChange(changed))

  expect(lastFormProps().manuscript).toBe(changed)
  expect(within(toggleOf('NinNA9')).getByText('edited')).toBeVisible()
  expect(screen.getByText('Form of NinNA9')).toBeVisible()
})

test('ignores a change that changes nothing', async () => {
  await renderLoadedManuscripts(services)
  await openManuscript(firstSiglum)
  act(() => lastFormProps().onChange(lastFormProps().manuscript))

  expect(mockFormRenders).toHaveLength(1)
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('searches with the current search function without rendering the rows', async () => {
  const entries: readonly BibliographyEntry[] = [new BibliographyEntry()]
  const replacement: ManuscriptsServices = {
    ...services,
    searchBibliography: jest.fn().mockResolvedValue(entries),
  }
  const view = await renderLoadedManuscripts(services)
  await openManuscript(firstSiglum)
  view.rerender(createManuscriptsElement(replacement))

  await expect(lastFormProps().searchBibliography('Borger')).resolves.toBe(
    entries,
  )
  expect(replacement.searchBibliography).toHaveBeenCalledWith('Borger')
  expect(services.searchBibliography).not.toHaveBeenCalled()
  expect(mockFormRenders).toHaveLength(1)
})

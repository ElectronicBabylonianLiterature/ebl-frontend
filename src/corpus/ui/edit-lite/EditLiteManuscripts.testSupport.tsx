import React from 'react'
import { render, RenderResult, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { PeriodModifiers } from 'common/utils/period'
import { Periods } from 'common/utils/periodDefinitions'
import {
  ChapterChange,
  ChapterRequest,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { describeChapterChange } from 'corpus/application/edit-lite/chapterRequests'
import TextService from 'corpus/application/TextService'
import { Manuscript, ManuscriptTypes } from 'corpus/domain/manuscript'
import { getProvenanceByName } from 'corpus/domain/provenance'
import EditLiteContext, {
  EditLiteActions,
  EditLiteContextValue,
} from 'corpus/ui/edit-lite/EditLiteContext'
import EditLiteManuscripts from 'corpus/ui/edit-lite/EditLiteManuscripts'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  restoreProvenanceState,
  snapshotProvenanceState,
  upsertProvenanceRecords,
} from 'test-support/provenance-state'
import { ChapterId } from 'transliteration/domain/chapter-id'

export interface ManuscriptsServices {
  readonly textService: jest.Mocked<TextService>
  readonly fragmentService: jest.Mocked<FragmentService>
  readonly searchBibliography: jest.Mock<
    Promise<readonly BibliographyEntry[]>,
    [string]
  >
}

export const manuscriptsChapterId: ChapterId = {
  textId: { genre: 'L', category: 1, index: 2 },
  stage: 'Standard Babylonian',
  name: 'I',
}

export const manuscriptsUncertainFragments: readonly string[] = ['K.1']

export const manuscriptsProvenanceRecords: readonly ProvenanceRecord[] = [
  {
    id: 'BABYLON',
    longName: 'Babylon',
    abbreviation: 'Bab',
    parent: 'Babylonia',
    sortKey: 1,
  },
  {
    id: 'ASSYRIA',
    longName: 'Assyria',
    abbreviation: 'Assa',
    parent: null,
    sortKey: 2,
  },
  {
    id: 'NINEVEH',
    longName: 'Nineveh',
    abbreviation: 'Nin',
    parent: 'Assyria',
    sortKey: 3,
  },
  {
    id: 'BABYLONIA',
    longName: 'Babylonia',
    abbreviation: 'Baba',
    parent: null,
    sortKey: 4,
  },
]

export const firstSiglum = 'NinNA1a'
export const secondSiglum = 'BabNBSch1'

export function setUpManuscriptsProvenances(): void {
  let provenanceSnapshot = snapshotProvenanceState()

  beforeEach(() => {
    provenanceSnapshot = snapshotProvenanceState()
    upsertProvenanceRecords(manuscriptsProvenanceRecords)
  })

  afterEach(() => {
    restoreProvenanceState(provenanceSnapshot)
  })
}

export function buildManuscripts(): Manuscript[] {
  return [
    new Manuscript({
      id: 1,
      siglumDisambiguator: '1a',
      museumNumber: 'K.5419.C',
      period: Periods['Neo-Assyrian'],
      provenance: getProvenanceByName('Nineveh'),
      type: ManuscriptTypes.Library,
      notes: 'first note',
    }),
    new Manuscript({
      id: 2,
      siglumDisambiguator: '1',
      accession: 'A.33',
      periodModifier: PeriodModifiers.Late,
      period: Periods['Neo-Babylonian'],
      provenance: getProvenanceByName('Babylon'),
      type: ManuscriptTypes.School,
    }),
  ]
}

export interface ManuscriptsContext extends EditLiteContextValue {
  readonly actions: jest.Mocked<EditLiteActions>
  readonly describeChange: jest.Mock<ChapterRequest, [ChapterChange]>
}

export interface ManuscriptsElementOptions {
  readonly id?: ChapterId
  readonly context?: ManuscriptsContext
  readonly version?: number
  readonly uncertainFragments?: readonly string[]
}

export function createManuscriptsContext(
  overrides: Partial<EditLiteContextValue> = {},
  id: ChapterId = manuscriptsChapterId,
): ManuscriptsContext {
  return {
    kind: 'legacy',
    canSave: false,
    canWrite: true,
    manuscripts: [],
    ...overrides,
    actions: {
      ensureLines: jest.fn(),
      changeLine: jest.fn(),
      resetLine: jest.fn(),
      saveLine: jest.fn(),
      addLine: jest.fn(),
      deleteLine: jest.fn(),
      moveLine: jest.fn(),
      importLines: jest.fn(),
      saveManuscripts: jest.fn(),
      reportUnsavedManuscripts: jest.fn(),
      openAnnotation: jest.fn(),
      changeAnnotation: jest.fn(),
      saveAnnotation: jest.fn(),
      leaveAnnotation: jest.fn(),
      countWordInstances: jest.fn(),
      lemmatizeInstances: jest.fn(),
    },
    describeChange: jest.fn(
      (change: ChapterChange): ChapterRequest =>
        describeChapterChange(id, change),
    ),
    searchLemma: jest.fn(),
    createProperNoun: jest.fn(),
  }
}

export function createManuscriptsElement(
  services: ManuscriptsServices,
  idOrOptions: ChapterId | ManuscriptsElementOptions = {},
): JSX.Element {
  const options: ManuscriptsElementOptions =
    'textId' in idOrOptions ? { id: idOrOptions } : idOrOptions
  const id = options.id ?? manuscriptsChapterId
  return (
    <EditLiteContext.Provider
      value={options.context ?? createManuscriptsContext({}, id)}
    >
      <EditLiteManuscripts
        id={id}
        uncertainFragments={
          options.uncertainFragments ?? manuscriptsUncertainFragments
        }
        version={options.version ?? 0}
        textService={services.textService}
        fragmentService={services.fragmentService}
        searchBibliography={services.searchBibliography}
      />
    </EditLiteContext.Provider>
  )
}

export async function renderLoadedManuscripts(
  services: ManuscriptsServices,
  options: ManuscriptsElementOptions = {},
): Promise<RenderResult> {
  const view = render(createManuscriptsElement(services, options))
  await screen.findByRole('list', { name: 'Manuscripts' })
  return view
}

export function toggleOf(siglum: string): HTMLElement {
  return screen.getByRole('button', {
    name: new RegExp(`^${_.escapeRegExp(siglum)}`),
  })
}

export function editorName(siglum: string): string {
  return `Editor for manuscript ${siglum}`
}

export function queryEditor(siglum: string): HTMLElement | null {
  return screen.queryByRole('group', { name: editorName(siglum) })
}

export async function openManuscript(siglum: string): Promise<HTMLElement> {
  await userEvent.click(toggleOf(siglum))
  return screen.getByRole('group', { name: editorName(siglum) })
}

export async function openPreview(
  container: HTMLElement = document.body,
): Promise<HTMLElement> {
  await userEvent.click(
    within(container).getByRole('button', { name: 'Preview request' }),
  )
  return screen.getByRole('dialog', { name: 'Request preview' })
}

function prototypesOf(value: object): object[] {
  const prototype: object | null = Object.getPrototypeOf(value)
  return prototype === null ? [] : [prototype, ...prototypesOf(prototype)]
}

export function calledMethodNames(service: object): string[] {
  return _.uniq(prototypesOf(service).flatMap(Object.getOwnPropertyNames))
    .filter((name) => name !== 'constructor')
    .filter((name) => {
      const method: unknown = Reflect.get(service, name)
      return jest.isMockFunction(method) && method.mock.calls.length > 0
    })
}

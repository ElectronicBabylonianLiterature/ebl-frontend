import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import { ChapterAtfSnapshotDto } from 'corpus/application/edit-lite/chapterAtfSnapshot'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  restoreProvenanceState,
  snapshotProvenanceState,
  upsertProvenanceRecords,
} from 'test-support/provenance-state'
import { ChapterId } from 'transliteration/domain/chapter-id'

export const editChapterId: ChapterId = {
  textId: { genre: 'L', category: 1, index: 2 },
  stage: 'Standard Babylonian',
  name: 'I',
}

export const editProvenanceRecords: readonly ProvenanceRecord[] = [
  { id: 'NINEVEH', longName: 'Nineveh', abbreviation: 'Nin', sortKey: 1 },
  { id: 'BABYLONIA', longName: 'Babylonia', abbreviation: 'Baba', sortKey: 2 },
]

export function setUpEditProvenances(): void {
  let provenanceSnapshot = snapshotProvenanceState()

  beforeEach(() => {
    provenanceSnapshot = snapshotProvenanceState()
    upsertProvenanceRecords(editProvenanceRecords)
  })

  afterEach(() => {
    restoreProvenanceState(provenanceSnapshot)
  })
}

export const chapterAtfHeader = [
  '&X000001 = L I.2 Poem of Creation (*Enūma eliš*) SB I',
  '#project: eblo',
  '#atf: lang akk-x-stdbab',
  '#atf: use unicode',
].join('\n')

export const chapterAtf = [
  chapterAtfHeader,
  [
    '#tr.en: When on high',
    '1. %n enūma | eliš',
    'NinNA1a o 1. e#-nu-ma# [e]-liš#',
    'BabaNBSch1 o 6′. [x x x] e-li-[iš]',
    '$ beginning of excerpt',
    '#note: collated',
  ].join('\n'),
  [
    '#tr.en: Nor below',
    '2. %n šapliš',
    '#note: a variant note',
    '// cf. L I.9 SB "II" 35-36',
    '// (LB 3272 Vs. 7)',
    'NinNA1a o i a+2-3b. šap-liš',
    'BabaNBSch1 4a.',
  ].join('\n'),
  ['#tr.ar: translation of the variant', '2. %n šapliš | ammatu'].join('\n'),
].join('\n\n')

export const snapshotDto: ChapterAtfSnapshotDto = {
  atf: chapterAtf,
  manuscripts: [
    {
      id: 1,
      siglumDisambiguator: '1a',
      museumNumber: { prefix: 'K', number: '5419', suffix: 'C' },
      accession: '',
      period: 'Neo-Assyrian',
      provenance: 'Nineveh',
      type: 'Library',
    },
    {
      id: 33,
      siglumDisambiguator: '1',
      museumNumber: null,
      accession: 'A.33',
      period: 'Neo-Babylonian',
      provenance: 'Babylonia',
      type: 'School',
    },
  ],
}

export const legacyLines: readonly Line[] = [
  createLine({
    number: '1',
    translation: '#tr.en: When on high',
    variants: [
      createVariant({
        reconstruction: '%n enūma | eliš',
        manuscripts: [
          createManuscriptLine({
            manuscriptId: 1,
            labels: ['o'],
            number: '1',
            atf: 'e#-nu-ma# [e]-liš#',
          }),
          createManuscriptLine({
            manuscriptId: 33,
            labels: ['o'],
            number: '6′',
            atf: '[x x x] e-li-[iš]\n$ beginning of excerpt\n#note: collated',
          }),
        ],
      }),
    ],
  }),
  createLine({
    number: '2',
    translation: '#tr.en: Nor below\n#tr.ar: translation of the variant',
    variants: [
      createVariant({
        reconstruction:
          '%n šapliš\n#note: a variant note\n// cf. L I.9 SB "II" 35-36\n// (LB 3272 Vs. 7)',
        manuscripts: [
          createManuscriptLine({
            manuscriptId: 1,
            labels: ['o', 'i'],
            number: 'a+2-3b',
            atf: 'šap-liš',
          }),
          createManuscriptLine({ manuscriptId: 33, number: '4a' }),
        ],
      }),
      createVariant({ reconstruction: '%n šapliš | ammatu' }),
    ],
  }),
]

export const legacyOutline: ChapterOutline = {
  textId: editChapterId.textId,
  classification: '',
  stage: 'Standard Babylonian',
  version: '',
  name: 'I',
  order: 0,
  uncertainFragments: [],
  manuscripts: [
    { id: 1, siglum: 'NinNA1a', museumNumber: 'K.5419.C', accession: '' },
    { id: 33, siglum: 'BabaNBSch1', museumNumber: '', accession: 'A.33' },
  ],
  lines: [
    {
      index: 0,
      number: '1',
      isSecondLineOfParallelism: false,
      isBeginningOfSection: false,
      translation: '#tr.en: When on high',
      variants: [{ reconstruction: '%n enūma | eliš', manuscriptIds: [1, 33] }],
    },
    {
      index: 1,
      number: '2',
      isSecondLineOfParallelism: false,
      isBeginningOfSection: false,
      translation: '#tr.en: Nor below\n#tr.ar: translation of the variant',
      variants: [
        {
          reconstruction:
            '%n šapliš\n#note: a variant note\n// cf. L I.9 SB "II" 35-36\n// (LB 3272 Vs. 7)',
          manuscriptIds: [1, 33],
        },
        { reconstruction: '%n šapliš | ammatu', manuscriptIds: [] },
      ],
    },
  ],
  revision: '',
}

export const apiOutline: ChapterOutline = {
  ...legacyOutline,
  classification: 'Ancient',
  order: 1,
  uncertainFragments: ['K.1'],
  revision: 'revision-1',
}

export function createTextServiceMock(): jest.Mocked<ChapterEditTextService> {
  return {
    findChapterOutline: jest.fn(),
    findChapterLines: jest.fn(),
    findChapterAtfSnapshot: jest.fn(),
    updateEditedLines: jest.fn(),
  }
}

export function pendingUntilAborted(signal?: AbortSignal): Promise<never> {
  return new Promise<never>((_resolve, reject) => {
    signal?.addEventListener('abort', () =>
      reject(new DOMException('The operation was aborted.', 'AbortError')),
    )
  })
}

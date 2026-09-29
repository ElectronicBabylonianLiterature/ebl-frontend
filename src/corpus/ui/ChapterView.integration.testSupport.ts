import Chance from 'chance'
import FakeApi from 'test-support/FakeApi'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { textDto } from 'test-support/test-corpus-text'
import { lines } from 'test-support/test-fragment'
import { singleRulingDto } from 'test-support/lines/dollar'
import { oldSiglumDtoFactory } from 'test-support/old-siglum-fixtures'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import { joinDtoFactory } from 'test-support/join-fixtures'
import { stageToAbbreviation } from 'common/utils/period'
import { ProvenanceStateSnapshot } from 'test-support/provenance-state'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

type LineDetailsDto = Parameters<FakeApi['expectLineDetails']>[2]

export const chapterViewProvenanceRecords: readonly ProvenanceRecord[] = [
  {
    id: 'standard-text',
    longName: 'Standard Text',
    abbreviation: 'Std',
    parent: null,
    sortKey: 1,
  },
  {
    id: 'nippur',
    longName: 'Nippur',
    abbreviation: 'Nip',
    parent: null,
    sortKey: 2,
  },
]

export function createShowManuscriptsLineDetails(
  chance: Chance.Chance,
): LineDetailsDto {
  return {
    variants: [
      {
        originalIndex: 0,
        reconstruction: [],
        note: null,
        manuscripts: [
          {
            provenance: 'Standard Text',
            periodModifier: 'None',
            period: 'None',
            siglumDisambiguator: '1',
            oldSigla: [],
            type: 'None',
            labels: ['o'],
            line: lines[0],
            paratext: [singleRulingDto],
            references: [],
            joins: [],
            museumNumber: 'BM.X',
            isInFragmentarium: false,
            accession: 'X.1',
          },
          {
            provenance: 'Nippur',
            periodModifier: 'Early',
            period: 'Ur III',
            siglumDisambiguator: '1',
            oldSigla: [],
            type: 'Parallel',
            labels: [''],
            line: lines[0],
            paratext: [],
            references: [],
            joins: [],
            museumNumber: 'BM.X',
            isInFragmentarium: false,
            accession: 'X.1',
          },
          {
            provenance: 'Nippur',
            periodModifier: 'None',
            period: 'Ur III',
            siglumDisambiguator: '1',
            oldSigla: [],
            type: 'School',
            labels: [''],
            line: { type: 'EmptyLine', content: [], prefix: '' },
            paratext: [],
            references: [],
            joins: [],
            museumNumber: 'BM.X',
            isInFragmentarium: false,
            accession: 'X.1',
          },
          {
            provenance: 'Nippur',
            periodModifier: 'None',
            period: 'Ur III',
            siglumDisambiguator: '1',
            oldSigla: oldSiglumDtoFactory.buildList(
              2,
              {},
              { transient: { chance: chance } },
            ),
            type: 'School',
            labels: [''],
            line: { type: 'EmptyLine', content: [], prefix: '' },
            paratext: [],
            references: referenceDtoFactory.buildList(
              1,
              {},
              { transient: { chance: chance } },
            ),
            joins: [
              [
                joinDtoFactory.build(
                  {
                    isInFragmentarium: true,
                  },
                  { transient: { chance: chance } },
                ),
                joinDtoFactory.build(
                  {
                    isInFragmentarium: false,
                  },
                  { transient: { chance: chance } },
                ),
              ],
            ],
            museumNumber: 'BM.X',
            isInFragmentarium: false,
            accession: 'X.1',
          },
        ],
        parallelLines: [],
        intertext: [],
      },
    ],
  }
}

export function createSidebarLineDetails(lineIndex: number): LineDetailsDto {
  return {
    variants: [
      {
        originalIndex: 0,
        manuscripts: [
          {
            provenance: 'Standard Text',
            periodModifier: 'None',
            period: 'None',
            siglumDisambiguator: '',
            oldSigla: [],
            type: 'None',
            labels: [],
            line: lines[lineIndex],
            paratext: [singleRulingDto],
            references: [],
            joins: [],
            museumNumber: 'BM.X',
            isInFragmentarium: false,
            accession: 'X.1',
          },
        ],
      },
    ],
  }
}

export function createChapterViewApi(
  chapter: ChapterDisplay,
  provenanceSnapshot: ProvenanceStateSnapshot,
): FakeApi {
  const provenanceSnapshotDtos = provenanceSnapshot.map((record) =>
    Object.fromEntries(Object.entries(record)),
  )
  return new FakeApi()
    .allowProvenances(provenanceSnapshotDtos)
    .expectChapterDisplay(chapter)
    .expectText(textDto)
}

export function createChapterViewPath(chapter: ChapterDisplay): string {
  return `/corpus/${encodeURIComponent(
    chapter.id.textId.genre,
  )}/${encodeURIComponent(chapter.id.textId.category)}/${encodeURIComponent(
    chapter.id.textId.index,
  )}/${encodeURIComponent(
    stageToAbbreviation(chapter.id.stage),
  )}/${encodeURIComponent(chapter.id.name)}`
}

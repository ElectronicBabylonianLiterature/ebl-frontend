import Chance from 'chance'
import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { manuscriptDtoFactory } from 'test-support/manuscript-fixtures'
import { stageToAbbreviation } from 'common/utils/period'

export const chance = new Chance('chapter-edit-view-integration-test')

export const genre = 'L'
export const category = 1
export const index = 1
export const textName = 'Palm and Vine'
export const textDto = {
  genre: genre,
  category: category,
  index: index,
  name: textName,
  numberOfVerses: 99,
  approximateVerses: false,
  intro: '**Test**',
  chapters: [
    {
      stage: 'Old Babylonian',
      name: 'The First Chapter',
      title: [],
      uncertainFragments: [
        {
          museumNumber: {
            prefix: 'X',
            number: '1',
            suffix: '',
          },
        },
      ],
    },
    {
      stage: 'Neo-Babylonian',
      name: 'III',
      title: [],
      uncertainFragments: [],
    },
    {
      stage: 'Old Babylonian',
      name: 'The Second Chapter',
      title: [],
      uncertainFragments: [],
    },
  ],
  references: [],
}

export const textId = {
  genre: genre,
  category: category,
  index: index,
}

export const chapterDtos = [
  {
    textId: textId,
    classification: 'Ancient',
    stage: 'Old Babylonian',
    version: 'B',
    name: 'The First Chapter',
    order: 1,
    manuscripts: [
      manuscriptDtoFactory.build(
        {
          siglumDisambiguator: '1c',
          oldSigla: [],
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: 'Late',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: 'some notes',
          colophon: '1. kur',
          unplacedLines: '1. bu',
          references: [],
          joins: [],
          isInFragmentarium: false,
        },
        { transient: { chance } },
      ),
    ],
    uncertainFragments: [],
    lines: [],
  },
  {
    textId: textId,
    classification: 'Ancient',
    stage: 'Neo-Babylonian',
    version: 'A',
    name: 'III',
    order: 3,
    manuscripts: [],
    uncertainFragments: [],
    lines: [],
  },
  {
    textId: textId,
    classification: 'Ancient',
    stage: 'Old Babylonian',
    version: '',
    name: 'The Second Chapter',
    order: 5,
    manuscripts: [1, 2].map((id) =>
      manuscriptDtoFactory.build({ id }, { transient: { chance } }),
    ),
    uncertainFragments: [],
    lines: [
      {
        number: "1'",
        isBeginningOfSection: false,
        isSecondLineOfParallelism: false,
        translation: '#tr.en: translation',
        variants: [
          {
            reconstruction: 'ideal',
            intertext: 'this is intertext',
            manuscripts: [
              {
                manuscriptId: 1,
                labels: ['iii'],
                number: 'a+1',
                atf: 'kur',
                omittedWords: [],
              },
            ],
          },
        ],
      },
    ],
  },
]

export const defaultManuscriptDto = {
  id: null,
  siglumDisambiguator: '',
  oldSigla: [],
  museumNumber: '',
  accession: '',
  periodModifier: 'None',
  period: 'Neo-Assyrian',
  provenance: 'Nineveh',
  type: 'Library',
  notes: '',
  colophon: '',
  unplacedLines: '',
  references: [],
}

export const defaultLineDto = {
  number: '',
  isBeginningOfSection: false,
  isSecondLineOfParallelism: false,
  translation: '',
  variants: [
    {
      reconstruction: '%n ',
      intertext: '',
      manuscripts: [],
    },
  ],
}

export const provenanceDtos = [
  {
    id: 'nineveh',
    longName: 'Nineveh',
    abbreviation: 'Nin',
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
  {
    id: 'borsippa',
    longName: 'Borsippa',
    abbreviation: 'Bor',
    parent: null,
    sortKey: 3,
  },
]

export function createChapterPath(stage: string, name: string): string {
  return `/corpus/${encodeURIComponent(genre)}/${encodeURIComponent(
    category,
  )}/${encodeURIComponent(index)}/${encodeURIComponent(
    stageToAbbreviation(stage),
  )}/${encodeURIComponent(name)}/edit`
}

export function createChapterTitle(chapter): string {
  return `${textDto.name} ${chapter.stage} ${chapter.name}`
}

export async function setUpChapterEditView(
  chapter,
): Promise<{ fakeApi: FakeApi; appDriver: AppDriver }> {
  const fakeApi = new FakeApi()

    .allowProvenances(provenanceDtos)

    .expectText(textDto)

    .expectChapter(chapter)

  const appDriver = new AppDriver(fakeApi.client)

    .withSession()

    .withPath(createChapterPath(chapter.stage, chapter.name))

    .render()

  await appDriver.waitForText(`Edit ${createChapterTitle(chapter)}`)

  await appDriver.waitForText('Save manuscripts')

  return { fakeApi: fakeApi, appDriver: appDriver }
}

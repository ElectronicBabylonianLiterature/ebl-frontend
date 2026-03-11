import _ from 'lodash'
import Chance from 'chance'

import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { produce } from 'immer'
import { manuscriptDtoFactory } from 'test-support/manuscript-fixtures'
import { stageToAbbreviation } from 'common/period'

const chance = new Chance('chapter-edit-view-integration-test')

const genre = 'L'
const category = 1
const index = 1
const textName = 'Palm and Vine'
const textDto = {
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

const textId = {
  genre: genre,
  category: category,
  index: index,
}

const chapterDtos = [
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

const defaultManuscriptDto = {
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

const defaultLineDto = {
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

const provenanceDtos = [
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

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Display chapter', () => {
  const chapter = chapterDtos[0]

  beforeEach(async () => {
    await setup(chapter)
  })

  test('Breadcrumbs', () => {
    appDriver.breadcrumbs.expectCrumbs([
      'eBL',
      'Corpus',
      `I.1 ${textName}`,
      `Chapter ${chapter.stage} ${chapter.name}`,
      'Edit',
    ])
  })

  test.each([
    ['Classification', 'classification'],
    ['Stage', 'stage'],
    ['Version', 'version'],
    ['Name', 'name'],
  ])('%s', (label, property) => {
    appDriver.expectInputElement(label, chapter[property])
  })

  describe('Manuscript', () => {
    const manuscript = chapter.manuscripts[0]

    test.each([
      ['Siglum', 'siglumDisambiguator', 'b'],
      ['Museum Number', 'museumNumber', 'BM.X2'],
      ['Accession', 'accession', 'X.2'],
      ['Period modifier', 'periodModifier', 'Early'],
      ['Period', 'period', 'Hellenistic'],
      ['Provenance', 'provenance', 'Borsippa'],
      ['Type', 'type', 'Commentary'],
      ['Notes', 'notes', 'more notes'],
    ])('%s', async (label, property, newValue) => {
      fakeApi.expectUpdateManuscripts(chapter, {
        manuscripts: [
          {
            ..._.omit(chapter.manuscripts[0], ['joins', 'isInFragmentarium']),
            [property]: newValue,
          },
        ],
        uncertainFragments: chapter.uncertainFragments,
      })
      const value = manuscript[property]
      const expectedValue = value.name ? value.name : value
      appDriver.expectInputElement(label, expectedValue)
      appDriver.changeValueByLabel(label, newValue)
      appDriver.expectInputElement(label, newValue)
      appDriver.click('Save manuscripts')
      await appDriver.waitForTextToDisappear('Saving...')
    })
  })
})

describe('Add manuscript', () => {
  const chapter = chapterDtos[1]

  beforeEach(async () => {
    await setup(chapter)
  })

  test.each([
    ['Siglum', 'siglumDisambiguator', ''],
    ['Museum Number', 'museumNumber', ''],
    ['Accession', 'accession', ''],
    ['Period modifier', 'periodModifier', 'None'],
    ['Period', 'period', 'Neo-Assyrian'],
    ['Provenance', 'provenance', 'Nineveh'],
    ['Type', 'type', 'Library'],
    ['Notes', 'notes', ''],
  ])('%s', async (label, property, expectedValue) => {
    const manuscript = {
      ...defaultManuscriptDto,
      [property]: expectedValue,
      id: 1,
    }
    fakeApi.expectUpdateManuscripts(chapter, {
      manuscripts: [manuscript],
      uncertainFragments: [],
    })
    appDriver.click('Add manuscript')
    appDriver.expectInputElement(label, expectedValue)
    appDriver.click('Save manuscripts')
    await appDriver.waitForTextToDisappear('Saving...')
  })
})

test('Uncertain Fragments', async () => {
  const chapter = chapterDtos[1]
  const museumNumber = 'X.1'
  const label = 'Museum Number'

  await setup(chapter)
  appDriver.click('Add fragment')
  appDriver.changeValueByLabel(label, museumNumber)
  appDriver.expectInputElement(label, museumNumber)
  appDriver.click('Save manuscripts')
  await appDriver.waitForTextToDisappear('Saving...')

  fakeApi.expectUpdateManuscripts(chapterDtos[1], {
    manuscripts: chapter.manuscripts,
    uncertainFragments: [museumNumber],
  })
})

describe('Lines', () => {
  const chapter = chapterDtos[2]
  const line = chapter.lines[0]

  beforeEach(async () => {
    await setup(chapter)
    appDriver.click('Lines')
  })

  test.each([['Number', 'number', '2']])(
    '%s',
    async (label, property, newValue) => {
      fakeApi.expectUpdateLines(chapter, {
        edited: [
          {
            index: 0,
            line: produce(chapter.lines[0], (draft) => {
              draft[property] = newValue
            }),
          },
        ],
        new: [],
        deleted: [],
      })
      const expectedValue = line[property]
      appDriver.expectInputElement(label, expectedValue)
      appDriver.changeValueByLabel(label, newValue)
      appDriver.expectInputElement(label, newValue)
      appDriver.click('Save lines')
      await appDriver.waitForTextToDisappear('Saving...')
    },
  )

  test.each([
    ['second line of parallelism', 'isSecondLineOfParallelism'],
    ['beginning of a section', 'isBeginningOfSection'],
  ])('%s', async (label, property) => {
    fakeApi.expectUpdateLines(chapter, {
      edited: [
        {
          index: 0,
          line: produce(chapter.lines[0], (draft) => {
            draft[property] = !draft[property]
          }),
        },
      ],
      new: [],
      deleted: [],
    })
    const expectedValue = line[property]
    expectedValue
      ? appDriver.expectChecked(label)
      : appDriver.expectNotChecked(label)
    appDriver.click(label)
    expectedValue
      ? appDriver.expectNotChecked(label)
      : appDriver.expectChecked(label)
    appDriver.click('Save lines')
    await appDriver.waitForTextToDisappear('Saving...')
  })
})

describe('Add line', () => {
  const chapter = chapterDtos[0]

  beforeEach(async () => {
    await setup(chapter)
    appDriver.click('Lines')
  })

  test.each([['Number', 'number']])('%s', async (label, property) => {
    fakeApi.expectUpdateLines(chapter, {
      new: [_.omit(defaultLineDto, 'status')],
      edited: [],
      deleted: [],
    })
    appDriver.click('Add line')
    appDriver.expectInputElement(label, defaultLineDto[property])
    appDriver.click('Save lines')
    await appDriver.waitForTextToDisappear('Saving...')
  })
})

test('Delete line', async () => {
  const chapter = chapterDtos[2]
  await setup(chapter)
  appDriver.click('Lines')
  fakeApi.expectUpdateLines(chapter, {
    new: [],
    edited: [],
    deleted: [0],
  })

  appDriver.click('Delete line')
  await appDriver.waitForTextToDisappear('Delete line')
  appDriver.click('Save lines')
  await appDriver.waitForTextToDisappear('Saving...')
})

test('Import chapter', async () => {
  const chapter = chapterDtos[0]
  fakeApi.expectImportChapter(chapter, '1. kur')
  await setup(chapter)
  appDriver.click('Import')
  appDriver.click('Save')
  await appDriver.waitForTextToDisappear('Saving...')
})

async function setup(chapter) {
  fakeApi = new FakeApi()
    .allowProvenances(provenanceDtos)
    .expectText(textDto)
    .expectChapter(chapter)
  appDriver = new AppDriver(fakeApi.client)
    .withSession()
    .withPath(createChapterPath(chapter.stage, chapter.name))
    .render()
  await appDriver.waitForText(`Edit ${createChapterTitle(chapter)}`)
  await appDriver.waitForText('Save manuscripts')
}

function createChapterPath(stage: string, name: string) {
  return `/corpus/${encodeURIComponent(genre)}/${encodeURIComponent(
    category,
  )}/${encodeURIComponent(index)}/${encodeURIComponent(
    stageToAbbreviation(stage),
  )}/${encodeURIComponent(name)}/edit`
}

function createChapterTitle(chapter) {
  return `${textDto.name} ${chapter.stage} ${chapter.name}`
}

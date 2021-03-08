import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { produce } from 'immer'

const category = 1
const index = 1
const textDto = {
  category: category,
  index: index,
  name: 'Palm and Vine',
  numberOfVerses: 99,
  approximateVerses: false,
  chapters: [
    {
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
      classification: 'Ancient',
      stage: 'Old Babylonian',
      version: 'B',
      name: 'The First Chapter',
      order: 1,
      manuscripts: [
        {
          id: 1,
          siglumDisambiguator: '1c',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: 'Late',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: 'some notes',
          colophon: '1. kur',
          references: [],
        },
      ],
      uncertainFragments: [],
      lines: [],
    },
    {
      classification: 'Ancient',
      stage: 'Old Babylonian',
      version: '',
      name: 'The Second Chapter',
      order: 5,
      manuscripts: [
        {
          id: 1,
          siglumDisambiguator: 'A',
          museumNumber: '',
          accession: '',
          periodModifier: 'Late',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: '',
          colophon: '',
          references: [],
        },
        {
          id: 2,
          siglumDisambiguator: 'B',
          museumNumber: '',
          accession: '',
          periodModifier: 'Late',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: '',
          colophon: '',
          references: [],
        },
      ],
      uncertainFragments: [],
      lines: [
        {
          number: "1'",
          isBeginningOfSection: false,
          isSecondLineOfParallelism: false,
          variants: [
            {
              reconstruction: 'ideal',
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
  ],
}
const defaultManuscriptDto = {
  id: null,
  siglumDisambiguator: '',
  museumNumber: '',
  accession: '',
  periodModifier: 'None',
  period: 'Neo-Assyrian',
  provenance: 'Nineveh',
  type: 'Library',
  notes: '',
  colophon: '',
  references: [],
}

const defaultLineDto = {
  number: '',
  isBeginningOfSection: false,
  isSecondLineOfParallelism: false,
  variants: [
    {
      reconstruction: '%n ',
      manuscripts: [],
    },
  ],
}

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Diplay chapter', () => {
  const chapter = textDto.chapters[1]
  const chapterTitle = createChapterTitle(chapter)

  beforeEach(async () => {
    await setup(chapter)
  })

  test('Breadcrumbs', () => {
    appDriver.expectBreadcrumbs(['eBL', 'Corpus', chapterTitle])
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
      fakeApi.expectUpdateManuscripts(
        textDto,
        1,
        produce(textDto.chapters[1].manuscripts, (draft) => ({
          manuscripts: [
            {
              ...draft[0],
              [property]: newValue,
            },
          ],
          uncertainFragments: textDto.chapters[1].uncertainFragments,
        }))
      )
      const value = manuscript[property]
      const expectedValue = value.name ? value.name : value
      appDriver.expectInputElement(label, expectedValue)
      await appDriver.changeValueByLabel(label, newValue)
      appDriver.expectInputElement(label, newValue)
      await appDriver.click('Save manuscripts')
    })
  })
})

describe('Add manuscript', () => {
  const chapter = textDto.chapters[0]

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
    fakeApi.expectUpdateManuscripts(textDto, 0, {
      manuscripts: [manuscript],
      uncertainFragments: [],
    })
    await appDriver.click('Add manuscript')
    appDriver.expectInputElement(label, expectedValue)
    await appDriver.click('Save manuscripts')
  })
})

test('Uncertain Fragments', async () => {
  const chapter = textDto.chapters[0]
  const museumNumber = 'X.1'
  const label = 'Museum Number'

  await setup(chapter)
  await appDriver.click('Add fragment')
  await appDriver.changeValueByLabel(label, museumNumber)
  appDriver.expectInputElement(label, museumNumber)
  await appDriver.click('Save manuscripts')

  fakeApi.expectUpdateManuscripts(textDto, 0, {
    manuscripts: chapter.manuscripts,
    uncertainFragments: [museumNumber],
  })
})

describe('Lines', () => {
  const chapter = textDto.chapters[2]
  const line = chapter.lines[0]

  beforeEach(async () => {
    await setup(chapter, false)
    await appDriver.click('Lines')
  })

  test.each([['Number', 'number', '2']])(
    '%s',
    async (label, property, newValue) => {
      fakeApi.expectUpdateLines(textDto, 2, {
        lines: [
          produce(textDto.chapters[2].lines[0], (draft) => {
            draft[property] = newValue
          }),
        ],
      })
      const expectedValue = line[property]
      appDriver.expectInputElement(label, expectedValue)
      await appDriver.changeValueByLabel(label, newValue)
      appDriver.expectInputElement(label, newValue)
      await appDriver.click('Save lines')
    }
  )

  test.each([
    ['second line of parallelism', 'isSecondLineOfParallelism'],
    ['beginning of a section', 'isBeginningOfSection'],
  ])('%s', async (label, property) => {
    fakeApi.expectUpdateLines(textDto, 2, {
      lines: [
        produce(textDto.chapters[2].lines[0], (draft) => {
          draft[property] = !draft[property]
        }),
      ],
    })
    const expectedValue = line[property]
    expectedValue
      ? appDriver.expectChecked(label)
      : appDriver.expectNotChecked(label)
    await appDriver.click(label)
    expectedValue
      ? appDriver.expectNotChecked(label)
      : appDriver.expectChecked(label)
    await appDriver.click('Save lines')
  })
})

describe('Add line', () => {
  const chapter = textDto.chapters[1]

  beforeEach(async () => {
    await setup(chapter)
    await appDriver.click('Lines')
  })

  test.each([['Number', 'number']])('%s', async (label, property) => {
    fakeApi.expectUpdateLines(textDto, 1, { lines: [defaultLineDto] })
    await appDriver.click('Add line')
    appDriver.expectInputElement(label, defaultLineDto[property])
    await appDriver.click('Save lines')
  })
})

test('Import chapter', async () => {
  const chapter = textDto.chapters[1]
  fakeApi.expectImportChapter(textDto, 1, '1. kur')
  await setup(chapter)
  await appDriver.click('Import')
  await appDriver.click('Save')
})

describe('Chapter not found', () => {
  const chapter = textDto.chapters[1]
  const chapterName = 'Unknown Chapter'

  beforeEach(async () => {
    fakeApi = new FakeApi().allowText(textDto)
    appDriver = await new AppDriver(fakeApi.client)
      .withSession()
      .withPath(createChapterPath(chapter.stage, chapterName))
      .render()

    await appDriver.waitForText(`Edit ${textDto.name}`)
  })

  test('Error message', () => {
    appDriver.expectTextContent(`Chapter not found.`)
  })
})

async function setup(chapter, expectText = true) {
  fakeApi = expectText
    ? new FakeApi().expectText(textDto)
    : new FakeApi().allowText(textDto)
  appDriver = await new AppDriver(fakeApi.client)
    .withSession()
    .withPath(createChapterPath(chapter.stage, chapter.name))
    .render()
  await appDriver.waitForText(`Edit ${createChapterTitle(chapter)}`)
}

function createChapterPath(stage: string, name: string) {
  return `/corpus/${encodeURIComponent(category)}/${encodeURIComponent(
    index
  )}/${encodeURIComponent(stage)}/${encodeURIComponent(name)}`
}

function createChapterTitle(chapter) {
  return `${textDto.name} ${chapter.stage} ${chapter.name}`
}

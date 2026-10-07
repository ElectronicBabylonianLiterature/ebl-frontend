import _ from 'lodash'
import { produce } from 'immer'
import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import {
  chapterDtos,
  defaultLineDto,
  defaultManuscriptDto,
  setUpChapterEditView,
  textName,
} from 'corpus/ui/ChapterEditView.testSupport'

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
  const context = await setUpChapterEditView(chapter)

  fakeApi = context.fakeApi

  appDriver = context.appDriver
}

import { Record, List } from 'immutable'
import AppDriver from 'test-helpers/AppDriver'
import FakeApi from 'test-helpers/FakeApi'

const category = 1
const index = 1
const textDto = {
  category: category,
  index: index,
  name: 'Palm and Vine',
  chapters: [
    {
      classification: 'Ancient',
      stage: 'Neo-Babylonian',
      version: 'A',
      name: 'III',
      order: 3,
      manuscripts: []
    },
    {
      classification: 'Ancient',
      stage: 'Old Babylonian',
      version: 'B',
      name: 'The First Chapter',
      order: 1,
      manuscripts: [
        {
          uniqueId: 'abc-cde-123',
          siglum: 'UIII Nippur 1',
          siglumDisambiguator: '1c',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: 'Late',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: 'some notes',
          bibliography: []
        }
      ]
    }
  ]
}

let apiDriver
let appDriver

afterEach(() => {
  expect(apiDriver.verifyExpectations()).toEqual(List())
})

describe('Diplay chapter', () => {
  const chapter = textDto.chapters[1]
  const chapterTitle = createChapterTitle(chapter)

  beforeEach(async () => {
    apiDriver = new FakeApi().expectText(textDto)
    appDriver = new AppDriver(apiDriver.client)
      .withSession()
      .withPath(createChapterPath(chapter.stage, chapter.name))
      .render()

    await appDriver.waitForText(`Edit ${chapterTitle}`)
  })

  test('Breadcrumbs', () => {
    appDriver.expectBreadcrumbs([
      'eBL',
      'Corpus',
      chapterTitle
    ])
  })

  test.each([
    ['Classification', 'classification'],
    ['Stage', 'stage'],
    ['Version', 'version'],
    ['Name', 'name']
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
      ['Notes', 'notes', 'more notes']
    ])('%s', (label, property, newValue) => {
      const value = manuscript[property]
      const expectedValue = Record.isRecord(value) ? value.name : value
      appDriver.expectInputElement(label, expectedValue)
      appDriver.changeValueByLabel(label, newValue)
      appDriver.expectInputElement(label, newValue)
    })
  })
})

describe('Add manuscript', () => {
  const chapter = textDto.chapters[0]

  beforeEach(async () => {
    apiDriver = new FakeApi().allowText(textDto)
    appDriver = new AppDriver(apiDriver.client)
      .withSession()
      .withPath(createChapterPath(chapter.stage, chapter.name))
      .render()

    await appDriver.waitForText(`Edit ${createChapterTitle(chapter)}`)
  })

  test.each([
    ['Siglum', 'siglumDisambiguator', ''],
    ['Museum Number', 'museumNumber', ''],
    ['Accession', 'accession', ''],
    ['Period modifier', 'periodModifier', 'None'],
    ['Period', 'period', 'Neo-Assyrian'],
    ['Provenance', 'provenance', 'Nineveh'],
    ['Type', 'type', 'Library'],
    ['Notes', 'notes', '']
  ])('%s', (label, property, expectedValue) => {
    apiDriver.expectUpdateText(textDto)
    appDriver.click('Add manuscript')
    appDriver.expectInputElement(label, expectedValue)
    appDriver.click('Save')
  })
})

describe('Chapter not found', () => {
  const chapter = textDto.chapters[1]
  const chapterName = 'Unknown Chapter'

  beforeEach(async () => {
    apiDriver = new FakeApi().allowText(textDto)
    appDriver = new AppDriver(apiDriver.client)
      .withSession()
      .withPath(createChapterPath(chapter.stage, chapterName))
      .render()

    await appDriver.waitForText(`Edit ${textDto.name} ${chapter.stage} ${chapterName}`)
  })

  test('Error message', () => {
    appDriver.expectTextContent(`Chapter ${textDto.name} ${chapter.stage} ${chapterName} not found.`)
  })
})

function createChapterPath (stage, name) {
  return `/corpus/${encodeURIComponent(category)}/${encodeURIComponent(index)}/${encodeURIComponent(stage)}/${encodeURIComponent(name)}`
}

function createChapterTitle (chapter) {
  return `${textDto.name} ${chapter.stage} ${chapter.name}`
}

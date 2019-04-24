import { Record, set, setIn } from 'immutable'
import AppDriver from 'test-helpers/AppDriver'
import FakeApi from 'test-helpers/FakeApi'

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
          id: 'abc-cde-123',
          siglumDisambiguator: '1c',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: 'Late',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: 'some notes',
          references: []
        }
      ]
    }
  ]
}
const defaultManuscriptDto = {
  id: '',
  siglumDisambiguator: '',
  museumNumber: '',
  accession: '',
  periodModifier: 'None',
  period: 'Neo-Assyrian',
  provenance: 'Nineveh',
  type: 'Library',
  notes: '',
  references: []
}

let fakeApi
let appDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Diplay chapter', () => {
  const chapter = textDto.chapters[1]
  const chapterTitle = createChapterTitle(chapter)

  beforeEach(async () => {
    fakeApi = new FakeApi().expectText(textDto)
    appDriver = new AppDriver(fakeApi.client)
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
      fakeApi.expectUpdateText(setIn(textDto, ['chapters', 1, 'manuscripts', 0, property], newValue))
      const value = manuscript[property]
      const expectedValue = Record.isRecord(value) ? value.name : value
      appDriver.expectInputElement(label, expectedValue)
      appDriver.changeValueByLabel(label, newValue)
      appDriver.expectInputElement(label, newValue)
      appDriver.click('Save')
    })
  })
})

describe('Add manuscript', () => {
  const chapter = textDto.chapters[0]

  beforeEach(async () => {
    fakeApi = new FakeApi().allowText(textDto)
    appDriver = new AppDriver(fakeApi.client)
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
    const manuscript = set(defaultManuscriptDto, property, expectedValue)
    fakeApi.expectUpdateText(setIn(textDto, ['chapters', 0, 'manuscripts', 0], manuscript))
    appDriver.click('Add manuscript')
    appDriver.expectInputElement(label, expectedValue)
    appDriver.click('Save')
  })
})

describe('Chapter not found', () => {
  const chapter = textDto.chapters[1]
  const chapterName = 'Unknown Chapter'

  beforeEach(async () => {
    fakeApi = new FakeApi().allowText(textDto)
    appDriver = new AppDriver(fakeApi.client)
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

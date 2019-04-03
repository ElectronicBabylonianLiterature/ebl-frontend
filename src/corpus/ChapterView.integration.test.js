import { Record } from 'immutable'
import AppDriver from 'test-helpers/AppDriver'
import FakeApi from 'test-helpers/FakeApi'

const text = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  chapters: [
    {
      classification: 'Ancient',
      stage: 'Neo-Babylonian',
      name: 'III',
      order: 3,
      manuscripts: []
    },
    {
      classification: 'Ancient',
      stage: 'Old Babylonian',
      name: 'The First Chapter',
      order: 1,
      manuscripts: [
        {
          uniqueId: 'abc-cde-123',
          siglum: 'UIII Nippur 1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          bibliography: []
        }
      ]
    }
  ]
}

let apiDriver
let appDriver

beforeEach(async () => {
  apiDriver = new FakeApi().expectText(text)
  appDriver = new AppDriver(apiDriver.client).withSession()
})

describe('Diplay chapter', () => {
  const chapter = text.chapters[1]

  beforeEach(async () => {
    appDriver = appDriver
      .withPath(`/corpus/${encodeURIComponent(text.category)}.${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.stage + ' ' + chapter.name)}`)
      .render()

    await appDriver.waitForText(`Edit ${text.name} ${chapter.stage} ${chapter.name}`)
  })

  test('Breadcrumbs', () => {
    appDriver.expectBreadcrumbs([
      'eBL',
      'Corpus',
      text.name,
      `${chapter.stage} ${chapter.name}`
    ])
  })

  test.each([
    ['Classification', 'classification'],
    ['Stage', 'stage'],
    ['Name', 'name'],
    ['Order', 'order']
  ])('%s', (label, property) => {
    appDriver.expectInputElement(label, chapter[property])
  })

  describe('Manuscript', () => {
    const manuscript = chapter.manuscripts[0]

    test.each([
      ['Siglum', 'siglum', 'SB Hel 1'],
      ['Museum Number', 'museumNumber', 'BM.X2'],
      ['Accession', 'accession', 'X.2'],
      ['Period', 'period', 'Hellenistic'],
      ['Provenance', 'provenance', 'Borsippa'],
      ['Type', 'type', 'Commentary']
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
  const chapter = text.chapters[0]

  beforeEach(async () => {
    appDriver = appDriver
      .withPath(`/corpus/${encodeURIComponent(text.category)}.${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.stage + ' ' + chapter.name)}`)
      .render()

    await appDriver.waitForText(`Edit ${text.name} ${chapter.stage} ${chapter.name}`)
  })

  test.each([
    ['Siglum', 'siglum', ''],
    ['Museum Number', 'museumNumber', ''],
    ['Accession', 'accession', ''],
    ['Period', 'period', 'Neo-Assyrian'],
    ['Provenance', 'provenance', 'Nineveh'],
    ['Type', 'type', 'Library']
  ])('%s', (label, property, expectedValue) => {
    appDriver.click('Add manuscript')
    appDriver.expectInputElement(label, expectedValue)
  })
})

describe('Chapter not found', () => {
  const chapter = text.chapters[1]
  const chapterName = 'Unknown Chapter'

  beforeEach(async () => {
    appDriver = appDriver
      .withPath(`/corpus/${encodeURIComponent(text.category)}.${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.stage + ' ' + chapterName)}`)
      .render()

    await appDriver.waitForText(`Edit ${text.name} ${chapter.stage} ${chapterName}`)
  })

  test('Error message', () => {
    appDriver.expectTextContent(`Chapter ${chapter.stage} ${chapterName} not found.`)
  })
})

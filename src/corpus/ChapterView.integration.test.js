import { List } from 'immutable'
import _ from 'lodash'
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
  const chapter = text.chapters[1]

  beforeEach(async () => {
    apiDriver = new FakeApi().expectText(text)
    appDriver = new AppDriver(apiDriver.client)
      .withSession()
      .withPath(`/corpus/${encodeURIComponent(text.category)}/${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(chapter.name)}`)
      .render()

    await appDriver.waitForText(`Edit ${text.name} ${chapter.stage} ${chapter.name}`)
  })

  test('Breadcrumbs', () => {
    appDriver.expectBreadcrumbs([
      'eBL',
      'Corpus',
      `${text.name} ${chapter.stage} ${chapter.name}`
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
      ['City', 'provenance', 'Borsippa'],
      ['Type', 'type', 'Commentary'],
      ['Notes', 'notes', 'more notes']
    ])('%s', (label, property, newValue) => {
      const expectedValue = _.get(manuscript, property)
      appDriver.expectInputElement(label, expectedValue)
      appDriver.changeValueByLabel(label, newValue)
      appDriver.expectInputElement(label, newValue)
    })

    test('Region', () => {
      const label = 'Region'
      appDriver.expectInputElement(label, 'Babylonia')
      appDriver.changeValueByLabel(label, 'Assyria')
      appDriver.expectInputElement(label, 'Assyria')
    })
  })
})

describe('Add manuscript', () => {
  const chapter = text.chapters[0]

  beforeEach(async () => {
    apiDriver = new FakeApi().allowText(text)
    appDriver = new AppDriver(apiDriver.client)
      .withSession()
      .withPath(`/corpus/${encodeURIComponent(text.category)}/${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(chapter.name)}`)
      .render()

    await appDriver.waitForText(`Edit ${text.name} ${chapter.stage} ${chapter.name}`)
  })

  test.each([
    ['Siglum', ''],
    ['Museum Number', ''],
    ['Accession', ''],
    ['Period modifier', 'None'],
    ['Period', 'Neo-Assyrian'],
    ['Region', 'Assyria'],
    ['City', 'Nineveh'],
    ['Type', 'Library'],
    ['Notes', '']
  ])('%s', (label, expectedValue) => {
    apiDriver.expectUpdateText(text)
    appDriver.click('Add manuscript')
    appDriver.expectInputElement(label, expectedValue)
    appDriver.click('Save')
  })
})

describe('Chapter not found', () => {
  const chapter = text.chapters[1]
  const chapterName = 'Unknown Chapter'

  beforeEach(async () => {
    apiDriver = new FakeApi().allowText(text)
    appDriver = new AppDriver(apiDriver.client)
      .withSession()
      .withPath(`/corpus/${encodeURIComponent(text.category)}/${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(chapterName)}`)
      .render()

    await appDriver.waitForText(`Edit ${text.name} ${chapter.stage} ${chapterName}`)
  })

  test('Error message', () => {
    appDriver.expectTextContent(`Chapter ${text.name} ${chapter.stage} ${chapterName} not found.`)
  })
})

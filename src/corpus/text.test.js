
import { List } from 'immutable'
import _ from 'lodash'
import { createText, createChapter, createManuscript, periodModifiers, periods, provenances, types, createLine } from './text'

const manuscriptConfig = {
  id: 'abc-cde-123',
  siglumDisambiguator: '1',
  museumNumber: 'BM.X',
  accession: 'X.1',
  periodModifier: periodModifiers.get('Late'),
  period: periods.get('Ur III'),
  provenance: provenances.get('Nippur'),
  type: types.get('School'),
  notes: 'some notes',
  references: List()
}

const lineConfig = {
  number: '2',
  reconstruction: 'reconstructed text',
  manuscripts: List()
}

const chapterConfig = {
  classification: 'Ancient',
  stage: 'Old Babylonian',
  version: 'A',
  name: 'III',
  order: -1,
  manuscripts: List.of(createManuscript(manuscriptConfig)),
  lines: List.of(createLine(lineConfig))
}

const textConfig = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 930,
  approximateVerses: true,
  chapters: List.of(createChapter(chapterConfig))
}

describe('Text', () => {
  testProperties(textConfig, createText)
})

describe('Chapter', () => {
  testProperties(chapterConfig, createChapter)
})

describe('Manuscript', () => {
  testProperties(manuscriptConfig, createManuscript)
})

describe('Line', () => {
  testProperties(lineConfig, createLine)
})

function testProperties (config, factory) {
  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(factory(config)[property]).toEqual(expected)
  })
}

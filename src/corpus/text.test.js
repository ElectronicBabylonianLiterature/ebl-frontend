
import { List } from 'immutable'
import _ from 'lodash'
import { Text, Chapter, Manuscript, periodModifiers, periods, provenances, types } from './text'

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
  references: new List()
}

const chapterConfig = {
  classification: 'Ancient',
  stage: 'Old Babylonian',
  version: 'A',
  name: 'III',
  order: -1,
  manuscripts: List.of(new Manuscript(manuscriptConfig))
}

const textConfig = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 930,
  approximateVerses: true,
  chapters: List.of(new Chapter(chapterConfig))
}

describe('Text', () => {
  testProperties(textConfig, Text)
})

describe('Chapter', () => {
  testProperties(chapterConfig, Chapter)
})

describe('Manuscript', () => {
  testProperties(manuscriptConfig, Manuscript)
})

function testProperties (config, Model) {
  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(new Model(config)[property]).toEqual(expected)
  })
}

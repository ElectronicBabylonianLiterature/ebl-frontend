// @flow
import _ from 'lodash'
import {
  createText,
  createChapter,
  createManuscript,
  types,
  createLine,
  createManuscriptLine
} from './text'
import { periods, periodModifiers } from './period'
import { provenances } from './provenance'
import type { Chapter, Line, Manuscript, ManuscriptLine, Text } from './text'

const manuscriptConfig: $Shape<Manuscript> = {
  id: 1,
  siglumDisambiguator: '1',
  museumNumber: 'BM.X',
  accession: 'X.1',
  periodModifier: periodModifiers.first(),
  period: periods.first(),
  provenance: provenances.first(),
  type: types.first(),
  notes: 'some notes',
  references: []
}

const manuscrpitLineConfig: ManuscriptLine = {
  manuscriptId: 1,
  labels: ['iii'],
  number: 'a+1',
  atf: 'kur',
  atfTokens: [
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [],
      normalized: false,
      language: 'AKKADIAN',
      lemmatizable: true,
      erasure: 'NONE'
    }
  ]
}

const lineConfig: Line = {
  number: '2',
  reconstruction: 'reconstructed text',
  reconstructionTokens: [
    {
      type: 'AkkadianWord',
      value: 'reconstructed'
    },
    {
      type: 'AkkadianWord',
      value: 'text'
    }
  ],
  manuscripts: [createManuscriptLine(manuscrpitLineConfig)]
}

const chapterConfig: Chapter = {
  classification: 'Ancient',
  stage: 'Old Babylonian',
  version: 'A',
  name: 'III',
  order: -1,
  manuscripts: [createManuscript(manuscriptConfig)],
  lines: [createLine(lineConfig)]
}

const textConfig: Text = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 930,
  approximateVerses: true,
  chapters: [createChapter(chapterConfig)]
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

describe('Manuscript line', () => {
  testProperties(manuscrpitLineConfig, createManuscriptLine)
})

describe('Line', () => {
  testProperties(lineConfig, createLine)
})

function testProperties(config: any, factory: any => any) {
  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(factory(config)[property]).toEqual(expected)
  })
}

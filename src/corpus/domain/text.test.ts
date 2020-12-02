import _ from 'lodash'
import {
  Text,
  createText,
  createChapter,
  createManuscript,
  types,
  createLine,
  createManuscriptLine,
  Chapter,
  Line,
  Manuscript,
  ManuscriptLine,
} from './text'
import { periods, periodModifiers } from './period'
import { provenances } from './provenance'
import { text } from 'test-support/test-corpus-text'

const manuscriptConfig: Partial<Manuscript> = {
  id: 1,
  siglumDisambiguator: '1',
  museumNumber: 'BM.X',
  accession: 'X.1',
  periodModifier: periodModifiers.values().next().value,
  period: periods.values().next().value,
  provenance: provenances.values().next().value,
  type: types.values().next().value,
  notes: 'some notes',
  references: [],
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
      parts: [],
      cleanValue: 'kur',
      uniqueLemma: [],
      normalized: false,
      language: 'AKKADIAN',
      lemmatizable: true,
      erasure: 'NONE',
      alignment: null,
      variant: null,
      enclosureType: [],
    },
  ],
}

const lineConfig: Line = {
  number: '2',
  reconstruction: 'reconstructed text',
  reconstructionTokens: [
    {
      value: 'kur',
      cleanValue: 'kur',
      enclosureType: [],
      erasure: 'NONE',
      lemmatizable: true,
      alignment: null,
      variant: null,
      uniqueLemma: [],
      normalized: true,
      language: 'AKKADIAN',
      parts: [
        {
          value: 'kur',
          cleanValue: 'kur',
          enclosureType: [],
          erasure: 'NONE',
          type: 'ValueToken',
        },
      ],
      modifiers: [],
      type: 'AkkadianWord',
    },
    {
      value: 'ra',
      cleanValue: 'ra',
      enclosureType: [],
      erasure: 'NONE',
      lemmatizable: true,
      alignment: null,
      variant: null,
      uniqueLemma: [],
      normalized: true,
      language: 'AKKADIAN',
      parts: [
        {
          value: 'ra',
          cleanValue: 'ra',
          enclosureType: [],
          erasure: 'NONE',
          type: 'ValueToken',
        },
      ],
      modifiers: [],
      type: 'AkkadianWord',
    },
  ],
  isSecondLineOfParallelism: true,
  isBeginningOfSection: true,
  manuscripts: [createManuscriptLine(manuscrpitLineConfig)],
}

const chapterConfig: Partial<Chapter> = {
  classification: 'Ancient',
  stage: 'Old Babylonian',
  version: 'A',
  name: 'III',
  order: -1,
  manuscripts: [createManuscript(manuscriptConfig)],
  lines: [createLine(lineConfig)],
}

const textConfig: Partial<Text> = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 930,
  approximateVerses: true,
  chapters: [createChapter(chapterConfig)],
}

describe('Text', () => {
  testProperties(textConfig, createText)
})

describe('Chapter', () => {
  testProperties(chapterConfig, createChapter)

  test('alignment', () => {
    expect(text.chapters[0].alignment).toEqual([
      [
        [
          {
            value: 'kur',
            alignment: null,
            variant: '',
            language: 'AKKADIAN',
            isNormalized: false,
          },
          {
            value: 'ra',
            alignment: 1,
            variant: 'ra',
            language: 'AKKADIAN',
            isNormalized: false,
          },
          {
            value: '...',
          },
        ],
      ],
    ])
  })
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

function testProperties<T>(
  config: Partial<T>,
  factory: (config: Partial<T>) => T
) {
  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(factory(config)[property]).toEqual(expected)
  })
}

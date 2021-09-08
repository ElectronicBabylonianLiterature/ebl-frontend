import Reference from 'bibliography/domain/Reference'
import _ from 'lodash'
import { chapter } from 'test-support/test-corpus-text'
import { ChapterAlignment } from './alignment'
import {
  createLine,
  createManuscriptLine,
  EditStatus,
  Line,
  LineVariant,
  ManuscriptLine,
} from './line'
import { PeriodModifiers, Periods } from './period'
import { Provenances } from './provenance'
import { Chapter, createChapter, createText, Text } from './text'
import { Manuscript, ManuscriptTypes } from './manuscript'
import { manuscriptFactory } from 'test-support/manuscript-fixtures'

const manuscriptConfig: Partial<Manuscript> = {
  id: 1,
  siglumDisambiguator: '1',
  museumNumber: 'BM.X',
  accession: 'X.1',
  periodModifier: PeriodModifiers.None,
  period: Periods['Old Babylonian'],
  provenance: Provenances.Nineveh,
  type: ManuscriptTypes.Library,
  notes: 'some notes',
  colophon: '1. kur',
  unplacedLines: '1. bu',
  references: [],
  joins: [],
  isInFragmentarium: true,
}

const manuscrpitLineConfig: Partial<ManuscriptLine> = {
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
      alignable: true,
      erasure: 'NONE',
      alignment: null,
      variant: null,
      enclosureType: [],
    },
  ],
  omittedWords: [],
}

const lineConfig: Line = {
  number: '2',
  variants: [
    new LineVariant(
      'reconstructed text',
      [
        {
          value: 'kur',
          cleanValue: 'kur',
          enclosureType: [],
          erasure: 'NONE',
          lemmatizable: true,
          alignable: true,
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
          alignable: true,
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
      [createManuscriptLine(manuscrpitLineConfig)]
    ),
  ],
  isSecondLineOfParallelism: true,
  isBeginningOfSection: true,
  translation: '',
  status: EditStatus.CLEAN,
}

const stage = 'Old Babylonian'
const name = 'III'
const chapterConfig: Partial<Chapter> = {
  textId: { genre: 'L', category: 1, index: 1 },
  classification: 'Ancient',
  stage: stage,
  version: 'A',
  name: name,
  order: -1,
  manuscripts: manuscriptFactory.buildList(1),
  uncertainFragments: ['K.1'],
  lines: [createLine(lineConfig)],
}

const textConfig: Partial<Text> = {
  genre: 'L',
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 930,
  approximateVerses: true,
  intro: 'Introduction',
  chapters: [{ stage: stage, name: name, title: [], uncertainFragments: [] }],
  references: [new Reference()],
}

describe('Text', () => {
  testProperties(textConfig, createText)

  test('title', () => {
    expect(createText(textConfig).title).toEqual('I.1 Palm and Vine')
  })
})

describe('Chapter', () => {
  testProperties(chapterConfig, createChapter)

  test('alignment', () => {
    expect(chapter.alignment).toEqual(
      new ChapterAlignment([
        [
          [
            {
              alignment: [
                {
                  value: 'kur',
                  alignment: null,
                  variant: null,
                  isAlignable: true,
                  suggested: false,
                },
                {
                  value: 'ra',
                  alignment: 1,
                  variant: {
                    value: 'ra',
                    type: 'Word',
                    language: 'AKKADIAN',
                  },
                  isAlignable: true,
                  suggested: false,
                },
                {
                  value: '...',
                  alignment: null,
                  variant: null,
                  isAlignable: false,
                  suggested: false,
                },
              ],
              omittedWords: [],
            },
          ],
        ],
      ])
    )
  })
})

describe('Manuscript', () => {
  testProperties(
    manuscriptConfig,
    () =>
      new Manuscript(
        manuscriptConfig.id,
        manuscriptConfig.siglumDisambiguator,
        manuscriptConfig.museumNumber,
        manuscriptConfig.accession,
        manuscriptConfig.periodModifier,
        manuscriptConfig.period,
        manuscriptConfig.provenance,
        manuscriptConfig.type,
        manuscriptConfig.notes,
        manuscriptConfig.colophon,
        manuscriptConfig.unplacedLines,
        manuscriptConfig.references,
        manuscriptConfig.joins,
        manuscriptConfig.isInFragmentarium
      )
  )
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

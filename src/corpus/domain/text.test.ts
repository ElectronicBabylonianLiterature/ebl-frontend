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
  createVariant,
  LineVariant,
} from './text'
import { periods, periodModifiers } from './period'
import { provenances } from './provenance'
import { text } from 'test-support/test-corpus-text'
import { ChapterAlignment } from './alignment'

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
      [createManuscriptLine(manuscrpitLineConfig)]
    ),
  ],
  isSecondLineOfParallelism: true,
  isBeginningOfSection: true,
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
    expect(text.chapters[0].alignment).toEqual(
      new ChapterAlignment([
        [
          [
            {
              alignment: [
                {
                  value: 'kur',
                  alignment: 1,
                  variant: null,
                  isAlignable: true,
                  suggested: true,
                },
                {
                  value: 'ra',
                  alignment: 1,
                  variant: {
                    value: 'ra',
                    language: 'AKKADIAN',
                    isNormalized: true,
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
  testProperties(manuscriptConfig, createManuscript)
})

describe('Manuscript line', () => {
  testProperties(manuscrpitLineConfig, createManuscriptLine)
})

describe('Line', () => {
  testProperties(lineConfig, createLine)
})

describe('LineVariant', () => {
  test('alignment', () => {
    const variant = createVariant({
      reconstructionTokens: [
        {
          value: '%n',
          cleanValue: '%n',
          enclosureType: [],
          erasure: 'NONE',
          language: 'AKKADIAN',
          normalized: true,
          type: 'LanguageShift',
        },
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
      ],
      manuscripts: [
        createManuscriptLine({
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
            {
              type: 'Word',
              value: 'ra',
              parts: [],
              cleanValue: 'ra',
              uniqueLemma: [],
              normalized: false,
              language: 'AKKADIAN',
              lemmatizable: true,
              erasure: 'NONE',
              alignment: 2,
              variant: null,
              enclosureType: [],
            },
          ],
        }),
      ],
    })

    expect(variant.alignment).toEqual([
      {
        alignment: [
          {
            value: 'kur',
            alignment: 1,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
          {
            value: 'ra',
            alignment: 2,
            variant: null,
            isAlignable: true,
            suggested: false,
          },
        ],
        omittedWords: [],
      },
    ])
  })
})

function testProperties<T>(
  config: Partial<T>,
  factory: (config: Partial<T>) => T
) {
  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(factory(config)[property]).toEqual(expected)
  })
}

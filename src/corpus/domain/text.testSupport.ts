import Reference from 'bibliography/domain/Reference'
import _ from 'lodash'
import {
  createLine,
  createManuscriptLine,
  EditStatus,
  Line,
  LineVariant,
  ManuscriptLine,
} from 'corpus/domain/line'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { Provenances } from 'corpus/domain/provenance'
import { Text } from 'corpus/domain/text'
import { Chapter } from 'corpus/domain/chapter'
import { Manuscript, ManuscriptTypes } from 'corpus/domain/manuscript'
import { manuscriptFactory } from 'test-support/manuscript-fixtures'

export const manuscriptConfig: Partial<Manuscript> = {
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

export const manuscriptLineConfig: Partial<ManuscriptLine> = {
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
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
  ],
  omittedWords: [],
}

export const lineConfig: Line = {
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
          hasVariantAlignment: false,
          hasOmittedAlignment: false,
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
          hasVariantAlignment: false,
          hasOmittedAlignment: false,
        },
      ],
      [createManuscriptLine(manuscriptLineConfig)],
      'intertext',
      'note',
    ),
  ],
  isSecondLineOfParallelism: true,
  isBeginningOfSection: true,
  translation: '',
  status: EditStatus.CLEAN,
}

export const stage = 'Old Babylonian'
export const name = 'III'
export const chapterConfig: Partial<Chapter> = {
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

export const textConfig: Partial<Text> = {
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

export function testProperties<T>(
  config: Partial<T>,
  factory: (config: Partial<T>) => T,
): void {
  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(factory(config)[property]).toEqual(expected)
  })
}

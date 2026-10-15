import { readingWord } from 'test-support/complex-text/tokenBuilders'
import { TextLine } from 'transliteration/domain/text-line'

export const firstColumnSpan: TextLine = new TextLine({
  prefix: 'c3.',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '&2',
      value: '&2',
      type: 'Column',
      number: 2,
    },
    readingWord('kur'),
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '&',
      value: '&',
      number: null,
      type: 'Column',
    },
    readingWord('kur'),
  ],
  type: 'TextLine',
  lineNumber: {
    number: 3,
    hasPrime: false,
    prefixModifier: 'c',
    suffixModifier: null,
    type: 'LineNumber',
  },
})

export const span: TextLine = new TextLine({
  prefix: 'c4.',
  content: [
    readingWord('kur'),
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '&2',
      value: '&2',
      number: 2,
      type: 'Column',
    },
    readingWord('kur'),
  ],
  type: 'TextLine',
  lineNumber: {
    number: 3,
    hasPrime: false,
    prefixModifier: 'c',
    suffixModifier: null,
    type: 'LineNumber',
  },
})

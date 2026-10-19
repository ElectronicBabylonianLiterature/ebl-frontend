import { readingWord } from 'test-support/complex-text/tokenBuilders'
import { TextLine } from 'transliteration/domain/text-line'

export const implicitFirstColumn: TextLine = new TextLine({
  prefix: 'c2.',
  content: [
    readingWord('kur'),
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '&',
      value: '&',
      type: 'Column',
      number: null,
    },
    readingWord('kur'),
  ],
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: 'c',
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

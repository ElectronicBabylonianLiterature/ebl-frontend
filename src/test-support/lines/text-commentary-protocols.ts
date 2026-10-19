import { readingWord } from 'test-support/complex-text/tokenBuilders'
import { TextLine } from 'transliteration/domain/text-line'

export const commentaryProtocols = new TextLine({
  prefix: '9.',
  content: [
    readingWord('kur'),
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '!bs',
      value: '!bs',
      type: 'CommentaryProtocol',
    },
    readingWord('kur'),
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '!cm',
      value: '!cm',
      type: 'CommentaryProtocol',
    },
    readingWord('kur'),
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '!qt',
      value: '!qt',
      type: 'CommentaryProtocol',
    },
    readingWord('kur'),
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '!zz',
      value: '!zz',
      type: 'CommentaryProtocol',
    },
    readingWord('kur'),
  ],
  lineNumber: {
    number: 9,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

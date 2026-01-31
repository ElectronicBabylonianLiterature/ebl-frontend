import { Text } from 'transliteration/domain/text'
import Word from 'dictionary/domain/Word'

import { Word as WordToken } from 'transliteration/domain/token'
import note from 'test-support/lines/note'
import { TextLine } from 'transliteration/domain/text-line'
import { wordFactory } from './word-fixtures'

const testWord: WordToken = {
  type: 'Word',
  value: 'kur',
  cleanValue: 'kur',
  uniqueLemma: [],
  language: 'AKKADIAN',
  normalized: false,
  lemmatizable: true,
  alignable: true,
  erasure: 'NONE',
  alignment: null,
  variant: null,
  parts: [
    {
      type: 'Reading',
      value: 'kur',
      name: 'kur',
      cleanValue: 'kur',
      nameParts: [
        {
          type: 'ValueToken',
          value: 'kur',
          cleanValue: 'kur',
          enclosureType: [],
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      enclosureType: [],
    },
  ],
  enclosureType: [],
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
}

export default function createLemmatizationTestText(): [
  Text,
  [Word, Word, Word, Word],
] {
  const words = wordFactory.buildList(4) as [Word, Word, Word, Word]
  const text = new Text({
    lines: [
      new TextLine({
        type: 'TextLine',
        lineNumber: {
          type: 'LineNumber',
          number: 1,
          hasPrime: false,
          prefixModifier: null,
          suffixModifier: null,
        },
        prefix: '1.',
        content: [
          {
            ...testWord,
            value: 'k[ur',
            cleanValue: 'kur',
            uniqueLemma: [],
          },
          {
            ...testWord,
            value: 'n]u',
            cleanValue: 'nu',
            uniqueLemma: [],
          },
          {
            ...testWord,
            value: 'bu',
            cleanValue: 'bu',
            uniqueLemma: [words[0]._id],
          },
        ],
      }),
      note,
    ],
  })
  return [text, words]
}

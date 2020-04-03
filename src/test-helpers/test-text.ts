import { factory } from 'factory-girl'
import { Text } from 'fragmentarium/domain/text'
import Word from 'dictionary/domain/Word'

import { Word as WordToken } from '../fragmentarium/domain/token'

const testWord: WordToken = {
  type: 'Word',
  value: 'kur',
  uniqueLemma: [],
  language: 'AKKADIAN',
  normalized: false,
  lemmatizable: true,
  erasure: 'NONE',
  parts: [
    {
      type: 'Reading',
      value: 'kur',
      name: 'kur',
      nameParts: [
        {
          type: 'ValueToken',
          value: 'kur',
          enclosureType: []
        }
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      enclosureType: []
    }
  ],
  enclosureType: []
}

export default async function createLemmatizationTestText(): Promise<
  [Text, [Word, Word, Word, Word]]
> {
  const words = await factory.buildMany('word', 4)
  const text = new Text({
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            ...testWord,
            value: 'kur',
            uniqueLemma: [words[0]._id]
          },
          {
            ...testWord,
            value: 'nu',
            uniqueLemma: [words[1]._id]
          }
        ]
      }
    ]
  })
  return [text, words]
}

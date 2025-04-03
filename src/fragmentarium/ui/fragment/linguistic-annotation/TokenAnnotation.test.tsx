import { render } from '@testing-library/react'
import React from 'react'
import TokenAnnotation from './TokenAnnotation'
import { TextLine } from 'transliteration/domain/text-line'
import { Text } from 'transliteration/domain/text'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

let text: Text
let oldWord: Word

beforeEach(async () => {
  oldWord = wordFactory.build()

  text = new Text({
    lines: [
      new TextLine({
        type: 'TextLine',
        prefix: '1.',
        lineNumber: {
          number: 1,
          hasPrime: false,
          prefixModifier: null,
          suffixModifier: null,
          type: 'LineNumber',
        },
        content: [
          {
            uniqueLemma: [oldWord._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            alignable: true,
            enclosureType: [],
            erasure: 'NONE',
            cleanValue: 'kur',
            value: 'kur',
            alignment: null,
            variant: null,
            parts: [
              {
                enclosureType: [],
                cleanValue: 'kur',
                value: 'kur',
                name: 'kur',
                nameParts: [
                  {
                    enclosureType: [],
                    cleanValue: 'kur',
                    value: 'kur',
                    type: 'ValueToken',
                  },
                ],
                subIndex: 1,
                modifiers: [],
                flags: [],
                sign: null,
                type: 'Reading',
              },
            ],
            type: 'Word',
            hasVariantAlignment: false,
            hasOmittedAlignment: false,
          },
        ],
      }),
    ],
  })
  render(<TokenAnnotation text={text} editableTokens={editableTokens} />)
})

// it('displays the transliteration', () => {
// })

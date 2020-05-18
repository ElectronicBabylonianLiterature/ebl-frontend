import { NoteLine } from 'transliteration/domain/line'

const note: NoteLine = {
  prefix: '#note: ',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'this is a note ',
      value: 'this is a note ',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@i{italic text}',
      value: '@i{italic text}',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' ',
      value: ' ',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@akk{kur}',
      value: '@akk{kur}',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' ',
      value: ' ',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@sux{kur}',
      value: '@sux{kur}',
      type: 'ValueToken',
    },
  ],
  parts: [
    {
      text: 'this is a note ',
      type: 'StringPart',
    },
    {
      text: 'italic text',
      type: 'EmphasisPart',
    },
    {
      text: ' ',
      type: 'StringPart',
    },
    {
      language: 'AKKADIAN',
      tokens: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          language: 'AKKADIAN',
          normalized: false,
          lemmatizable: true,
          uniqueLemma: [],
          parts: [
            {
              enclosureType: [],
              erasure: 'NONE',
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  erasure: 'NONE',
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
        },
      ],
      type: 'LanguagePart',
    },
    {
      text: ' ',
      type: 'StringPart',
    },
    {
      language: 'SUMERIAN',
      tokens: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          language: 'SUMERIAN',
          normalized: false,
          lemmatizable: false,
          uniqueLemma: [],
          parts: [
            {
              enclosureType: [],
              erasure: 'NONE',
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  erasure: 'NONE',
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
        },
      ],
      type: 'LanguagePart',
    },
  ],
  type: 'NoteLine',
}

export default note

import { TextLine } from 'transliteration/domain/line'

export const lemmatized: TextLine[] = [
  {
    prefix: 'l1.',
    content: [
      {
        enclosureType: [],
        erasure: 'NONE',
        cleanValue: 'kur',
        value: 'kur',
        language: 'AKKADIAN',
        normalized: false,
        lemmatizable: true,
        uniqueLemma: ['hepû I', 'hepû II'],
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
      {
        enclosureType: [],
        erasure: 'NONE',
        cleanValue: '...',
        value: '...',
        type: 'UnknownNumberOfSigns',
      },
    ],
    lineNumber: {
      number: 1,
      hasPrime: false,
      prefixModifier: 'l',
      suffixModifier: null,
      type: 'LineNumber',
    },
    type: 'TextLine',
  },
  {
    prefix: 'l2.',
    content: [
      {
        enclosureType: [],
        erasure: 'NONE',
        cleanValue: 'kur',
        value: 'kur',
        language: 'AKKADIAN',
        normalized: false,
        lemmatizable: true,
        uniqueLemma: ['hepû I'],
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
    lineNumber: {
      number: 2,
      hasPrime: false,
      prefixModifier: 'l',
      suffixModifier: null,
      type: 'LineNumber',
    },
    type: 'TextLine',
  },
]

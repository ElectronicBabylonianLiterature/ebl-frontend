import { TextLine } from 'transliteration/domain/text-line'

export default new TextLine({
  prefix: '1.',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'erin₂-ŠA₂-ša₃/GIRI₃',
      value: 'erin₂-[(ŠA₂-ša₃/GIRI₃)',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      alignable: false,
      uniqueLemma: [],
      alignment: null,
      variant: null,
      parts: [
        {
          enclosureType: [],
          cleanValue: 'erin₂',
          value: 'erin₂',
          name: 'erin',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'erin',
              value: 'erin',
              type: 'ValueToken',
            },
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading',
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner',
        },
        {
          enclosureType: [],
          cleanValue: '',
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway',
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: '(',
          side: 'LEFT',
          type: 'PerhapsBrokenAway',
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: 'ŠA₂',
          value: 'ŠA₂',
          name: 'ŠA',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              cleanValue: 'ŠA',
              value: 'ŠA',
              type: 'ValueToken',
            },
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          surrogate: [],
          type: 'Logogram',
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: '-',
          value: '-',
          type: 'Joiner',
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: 'ša₃/GIRI₃',
          value: 'ša₃/GIRI₃',
          tokens: [
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              cleanValue: 'ša₃',
              value: 'ša₃',
              name: 'ša',
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  cleanValue: 'ša',
                  value: 'ša',
                  type: 'ValueToken',
                },
              ],
              subIndex: 3,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading',
            },
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              cleanValue: 'GIRI₃',
              value: 'GIRI₃',
              name: 'GIRI',
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  cleanValue: 'GIRI',
                  value: 'GIRI',
                  type: 'ValueToken',
                },
              ],
              subIndex: 3,
              modifiers: [],
              flags: [],
              sign: null,
              surrogate: [],
              type: 'Logogram',
            },
          ],
          type: 'Variant',
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: '',
          value: ')',
          side: 'RIGHT',
          type: 'PerhapsBrokenAway',
        },
      ],
      type: 'Word',
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'kur',
      value: 'kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      alignable: true,
      uniqueLemma: [],
      alignment: null,
      variant: null,
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
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      erasure: 'NONE',
      cleanValue: 'sah-SAH',
      value: 'sah-SAH',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      alignable: true,
      uniqueLemma: [],
      alignment: null,
      variant: null,
      parts: [
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: 'sah',
          value: 'sah',
          name: 'sah',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'sah',
              value: 'sah',
              type: 'ValueToken',
            },
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading',
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '-',
          value: '-',
          type: 'Joiner',
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: 'SAH',
          value: 'SAH',
          name: 'SAH',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'SAH',
              value: 'SAH',
              type: 'ValueToken',
            },
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          surrogate: [],
          type: 'Logogram',
        },
      ],
      type: 'Word',
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns',
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '',
      value: ']',
      side: 'RIGHT',
      type: 'BrokenAway',
    },
  ],
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

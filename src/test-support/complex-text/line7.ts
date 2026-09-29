import { TextLine } from 'transliteration/domain/text-line'

const line7 = new TextLine({
  prefix: '4.',
  content: [
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation',
    },
    {
      enclosureType: [],
      cleanValue: 'kurₓ@v(KUR@v#?)-KUR₂@v<(kur-kur)>',
      value: 'kurₓ@v#!(KUR@v#?)-KUR₂@v#?<(kur-kur)>',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      alignable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      alignment: null,
      variant: null,
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kurₓ@v(KUR@v#?)',
          value: 'kurₓ@v#!(KUR@v#?)',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken',
            },
          ],
          subIndex: null,
          modifiers: ['@v'],
          flags: ['#', '!'],
          sign: {
            enclosureType: [],
            cleanValue: 'KUR@v',
            value: 'KUR@v#?',
            name: 'KUR',
            modifiers: ['@v'],
            flags: ['#', '?'],
            type: 'Grapheme',
          },
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
          cleanValue: 'KUR₂@v<(kur-kur)>',
          value: 'KUR₂@v#?<(kur-kur)>',
          name: 'KUR',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'KUR',
              value: 'KUR',
              type: 'ValueToken',
            },
          ],
          subIndex: 2,
          modifiers: ['@v'],
          flags: ['#', '?'],
          sign: null,
          surrogate: [
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
            {
              enclosureType: [],
              cleanValue: '-',
              value: '-',
              type: 'Joiner',
            },
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
          type: 'Logogram',
        },
      ],
      type: 'Word',
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
  ],
  lineNumber: {
    number: 4,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line7

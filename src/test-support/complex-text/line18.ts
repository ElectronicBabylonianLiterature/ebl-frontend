import { TextLine } from 'transliteration/domain/text-line'

const line18 = new TextLine({
  prefix: "D+3'a-4b.",
  content: [
    {
      enclosureType: [],
      cleanValue: 'x',
      value: 'x',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      alignable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      alignment: null,
      variant: null,
      parts: [
        {
          enclosureType: [],
          cleanValue: 'x',
          value: 'x',
          flags: [],
          type: 'UnclearSign',
        },
      ],
      type: 'Word',
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
    {
      enclosureType: [],
      cleanValue: 'a-•',
      value: 'a-•?',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      alignable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      alignment: null,
      variant: null,
      parts: [
        {
          enclosureType: [],
          cleanValue: 'a',
          value: 'a',
          name: 'a',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'a',
              value: 'a',
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
          cleanValue: '•',
          value: '•?',
          flags: ['?'],
          type: 'EgyptianMetricalFeetSeparator',
        },
      ],
      type: 'Word',
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
  ],
  lineNumber: {
    start: {
      number: 3,
      hasPrime: true,
      prefixModifier: 'D',
      suffixModifier: 'a',
    },
    end: {
      number: 4,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: 'b',
    },
    type: 'LineNumberRange',
  },
  type: 'TextLine',
})

export default line18

import { TextLine } from 'transliteration/domain/text-line'

const line16 = new TextLine({
  prefix: '6.',
  content: [
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
      value: ']',
      side: 'RIGHT',
      type: 'BrokenAway',
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
      value: '{(',
      side: 'LEFT',
      type: 'DocumentOrientedGloss',
    },
    {
      enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: 'ra',
      value: 'ra',
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
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'ra',
          value: 'ra',
          name: 'ra',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'ra',
              value: 'ra',
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
      enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: '',
      value: ')}',
      side: 'RIGHT',
      type: 'DocumentOrientedGloss',
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
    number: 6,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line16

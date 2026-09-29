import { TextLine } from 'transliteration/domain/text-line'

const line17 = new TextLine({
  prefix: '7.',
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
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns',
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
      cleanValue: 'he-pi₂',
      value: 'he-p]i₂',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      alignable: true,
      uniqueLemma: ['hepû II'],
      erasure: 'NONE',
      alignment: null,
      variant: null,
      parts: [
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'he',
          value: 'he',
          name: 'he',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'he',
              value: 'he',
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
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: '-',
          value: '-',
          type: 'Joiner',
        },
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'pi₂',
          value: 'p]i₂',
          name: 'pi',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'p',
              value: 'p',
              type: 'ValueToken',
            },
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: '',
              value: ']',
              side: 'RIGHT',
              type: 'BrokenAway',
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'i',
              value: 'i',
              type: 'ValueToken',
            },
          ],
          subIndex: 2,
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
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: '',
      value: ')}',
      side: 'RIGHT',
      type: 'DocumentOrientedGloss',
    },
  ],
  lineNumber: {
    number: 7,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line17

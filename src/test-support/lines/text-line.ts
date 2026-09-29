import { TextLine, TextLineDto } from 'transliteration/domain/text-line'
import { textLineOpeningTokens } from 'test-support/lines/text-line-opening-tokens'

export const textLineDto: TextLineDto = {
  prefix: '1.',
  content: [
    ...textLineOpeningTokens,
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
}

const textLine = new TextLine(textLineDto)

export default textLine

import { TextLine } from 'transliteration/domain/text-line'
import { joiner, reading, word } from 'test-support/complex-text/tokenBuilders'

const line18 = new TextLine({
  prefix: "D+3'a-4b.",
  content: [
    word(
      'x',
      [
        {
          enclosureType: [],
          cleanValue: 'x',
          value: 'x',
          flags: [],
          type: 'UnclearSign',
        },
      ],
      { lemmatizable: false, alignable: false },
    ),
    word(
      'a-•?',
      [
        reading('a', 'a'),
        joiner('-'),
        {
          enclosureType: [],
          cleanValue: '•',
          value: '•?',
          flags: ['?'],
          type: 'EgyptianMetricalFeetSeparator',
        },
      ],
      { cleanValue: 'a-•', lemmatizable: false, alignable: false },
    ),
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

import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  reading,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line4 = new TextLine({
  prefix: '2.',
  content: [
    word('|KUR.KUR|', [
      {
        enclosureType: [],
        cleanValue: '|KUR.KUR|',
        value: '|KUR.KUR|',
        type: 'CompoundGrapheme',
      },
    ]),
    { enclosureType: [], cleanValue: 'ø', value: 'ø', type: 'WordOmitted' },
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation',
    },
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation',
    },
    word(
      'kur/|RA|',
      [
        {
          enclosureType: [],
          cleanValue: 'kur/|RA|',
          value: 'kur/|RA|',
          tokens: [
            reading('kur', 'kur'),
            {
              enclosureType: [],
              cleanValue: '|RA|',
              value: '|RA|',
              type: 'CompoundGrapheme',
            },
          ],
          type: 'Variant',
        },
      ],
      { lemmatizable: false, alignable: false },
    ),
    enclosure('BrokenAway', '[', 'LEFT'),
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns',
    },
    enclosure('BrokenAway', ']', 'RIGHT', { enclosureType: ['BROKEN_AWAY'] }),
  ],
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line4

import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  valueToken,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line6 = new TextLine({
  prefix: '3.',
  content: [
    word(
      '1@v#*',
      [
        {
          enclosureType: [],
          cleanValue: '1@v',
          value: '1@v#*',
          name: '1',
          nameParts: [valueToken('1')],
          subIndex: 1,
          modifiers: ['@v'],
          flags: ['#', '*'],
          sign: null,
          type: 'Number',
        },
      ],
      { cleanValue: '1@v' },
    ),
    word(
      'x#!',
      [
        {
          enclosureType: [],
          cleanValue: 'x',
          value: 'x#!',
          flags: ['#', '!'],
          type: 'UnclearSign',
        },
      ],
      { cleanValue: 'x', lemmatizable: false, alignable: false },
    ),
    word(
      'X#?',
      [
        {
          enclosureType: [],
          cleanValue: 'X',
          value: 'X#?',
          flags: ['#', '?'],
          type: 'UnidentifiedSign',
        },
      ],
      { cleanValue: 'X', lemmatizable: false, alignable: false },
    ),
    {
      enclosureType: [],
      cleanValue: '::@v@44',
      value: '::@v@44?#',
      divider: '::',
      modifiers: ['@v', '@44'],
      flags: ['?', '#'],
      type: 'Divider',
    },
    { enclosureType: [], cleanValue: '|', value: '|', type: 'LineBreak' },
    word(
      '[(x)',
      [
        enclosure('BrokenAway', '[', 'LEFT'),
        enclosure('PerhapsBrokenAway', '(', 'LEFT', {
          enclosureType: ['BROKEN_AWAY'],
        }),
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: 'x',
          value: 'x',
          flags: [],
          type: 'UnclearSign',
        },
        enclosure('PerhapsBrokenAway', ')', 'RIGHT', {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
        }),
      ],
      { cleanValue: 'x', lemmatizable: false, alignable: false },
    ),
    word(
      'x]',
      [
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: 'x',
          value: 'x',
          flags: [],
          type: 'UnclearSign',
        },
        enclosure('BrokenAway', ']', 'RIGHT', {
          enclosureType: ['BROKEN_AWAY'],
        }),
      ],
      {
        enclosureType: ['BROKEN_AWAY'],
        cleanValue: 'x',
        lemmatizable: false,
        alignable: false,
      },
    ),
  ],
  lineNumber: {
    number: 3,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line6

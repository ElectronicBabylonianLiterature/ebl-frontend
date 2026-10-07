import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  joiner,
  reading,
  valueToken,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line17 = new TextLine({
  prefix: '7.',
  content: [
    enclosure('BrokenAway', '[', 'LEFT'),
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns',
    },
    enclosure('DocumentOrientedGloss', '{(', 'LEFT', {
      enclosureType: ['BROKEN_AWAY'],
    }),
    word(
      'he-p]i₂',
      [
        reading('he', 'he', {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          nameParts: [
            valueToken('he', {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
            }),
          ],
        }),
        joiner('-', {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
        }),
        reading('p]i₂', 'pi', {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'pi₂',
          nameParts: [
            valueToken('p', {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
            }),
            enclosure('BrokenAway', ']', 'RIGHT', {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
            }),
            valueToken('i', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
          ],
          subIndex: 2,
        }),
      ],
      {
        enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
        cleanValue: 'he-pi₂',
        uniqueLemma: ['hepû II'],
      },
    ),
    enclosure('DocumentOrientedGloss', ')}', 'RIGHT', {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
    }),
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

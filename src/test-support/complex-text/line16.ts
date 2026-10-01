import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  reading,
  valueToken,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line16 = new TextLine({
  prefix: '6.',
  content: [
    enclosure('BrokenAway', '[', 'LEFT'),
    enclosure('BrokenAway', ']', 'RIGHT', { enclosureType: ['BROKEN_AWAY'] }),
    enclosure('BrokenAway', '[', 'LEFT'),
    enclosure('DocumentOrientedGloss', '{(', 'LEFT', {
      enclosureType: ['BROKEN_AWAY'],
    }),
    word(
      'ra',
      [
        reading('ra', 'ra', {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          nameParts: [
            valueToken('ra', {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
            }),
          ],
        }),
      ],
      { enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'] },
    ),
    enclosure('DocumentOrientedGloss', ')}', 'RIGHT', {
      enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
    }),
    enclosure('BrokenAway', ']', 'RIGHT', { enclosureType: ['BROKEN_AWAY'] }),
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

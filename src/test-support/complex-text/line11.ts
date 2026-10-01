import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  gloss,
  joiner,
  reading,
  valueToken,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line11 = new TextLine({
  prefix: '1.',
  content: [
    word(
      '[(kur)]-[{{k]ur-[kur}}]k[ur]',
      [
        enclosure('BrokenAway', '[', 'LEFT'),
        enclosure('PerhapsBrokenAway', '(', 'LEFT', {
          enclosureType: ['BROKEN_AWAY'],
        }),
        reading('kur', 'kur', {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          nameParts: [
            valueToken('kur', {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
            }),
          ],
        }),
        enclosure('PerhapsBrokenAway', ')', 'RIGHT', {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
        }),
        enclosure('BrokenAway', ']', 'RIGHT', {
          enclosureType: ['BROKEN_AWAY'],
        }),
        joiner('-'),
        enclosure('BrokenAway', '[', 'LEFT'),
        gloss(
          'LinguisticGloss',
          '{{k]ur-[kur}}',
          [
            reading('k]ur', 'kur', {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'kur',
              nameParts: [
                valueToken('k', { enclosureType: ['BROKEN_AWAY'] }),
                enclosure('BrokenAway', ']', 'RIGHT', {
                  enclosureType: ['BROKEN_AWAY'],
                }),
                valueToken('ur'),
              ],
            }),
            joiner('-'),
            enclosure('BrokenAway', '[', 'LEFT'),
            reading('kur', 'kur', {
              enclosureType: ['BROKEN_AWAY'],
              nameParts: [
                valueToken('kur', { enclosureType: ['BROKEN_AWAY'] }),
              ],
            }),
          ],
          { enclosureType: ['BROKEN_AWAY'], cleanValue: '{{kur-kur}}' },
        ),
        enclosure('BrokenAway', ']', 'RIGHT', {
          enclosureType: ['BROKEN_AWAY'],
        }),
        reading('k[ur', 'kur', {
          cleanValue: 'kur',
          nameParts: [
            valueToken('k'),
            enclosure('BrokenAway', '[', 'LEFT'),
            valueToken('ur', { enclosureType: ['BROKEN_AWAY'] }),
          ],
        }),
        enclosure('BrokenAway', ']', 'RIGHT', {
          enclosureType: ['BROKEN_AWAY'],
        }),
      ],
      { cleanValue: 'kur-{{kur-kur}}kur' },
    ),
  ],
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line11

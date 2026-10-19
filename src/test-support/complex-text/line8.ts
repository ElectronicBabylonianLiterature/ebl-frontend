import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  joiner,
  reading,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line8 = new TextLine({
  prefix: '5.',
  content: [
    enclosure('Erasure', '°', 'LEFT'),
    word('kur', [reading('kur', 'kur')], {
      lemmatizable: false,
      alignable: false,
      erasure: 'ERASED',
    }),
    enclosure('Erasure', '\\', 'CENTER'),
    word('kur', [reading('kur', 'kur')], {
      alignable: false,
      erasure: 'OVER_ERASED',
    }),
    enclosure('Erasure', '°', 'RIGHT'),
    word(
      'kur-°kur\\kur°-kur',
      [
        reading('kur', 'kur'),
        joiner('-'),
        enclosure('Erasure', '°', 'LEFT'),
        reading('kur', 'kur'),
        enclosure('Erasure', '\\', 'CENTER'),
        reading('kur', 'kur'),
        enclosure('Erasure', '°', 'RIGHT'),
        joiner('-'),
        reading('kur', 'kur'),
      ],
      { cleanValue: 'kur-kurkur-kur' },
    ),
  ],
  lineNumber: {
    number: 5,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line8

import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  joiner,
  logogram,
  reading,
  valueToken,
  word,
} from 'test-support/complex-text/tokenBuilders'
import {
  accidentalOmission,
  closedKur,
  enclosedKurReading,
  intentionalOmission,
  openedKur,
  removal,
} from 'test-support/complex-text/enclosedKur'

const gloss = 'DOCUMENT_ORIENTED_GLOSS'

const line15 = new TextLine({
  prefix: '5.',
  content: [
    ...[accidentalOmission, intentionalOmission, removal].flatMap((type) => [
      openedKur(type, []),
      closedKur(type, []),
    ]),
    enclosure('DocumentOrientedGloss', '{(', 'LEFT'),
    word(
      '<kur(KUR)',
      [
        enclosure('AccidentalOmission', '<', 'LEFT', {
          enclosureType: [gloss],
        }),
        reading('kur(KUR)', 'kur', {
          enclosureType: [gloss, 'ACCIDENTAL_OMISSION'],
          nameParts: [
            valueToken('kur', {
              enclosureType: [gloss, 'ACCIDENTAL_OMISSION'],
            }),
          ],
          sign: {
            enclosureType: [],
            cleanValue: 'KUR',
            value: 'KUR',
            name: 'KUR',
            modifiers: [],
            flags: [],
            type: 'Grapheme',
          },
        }),
      ],
      { enclosureType: [gloss], cleanValue: 'kur(KUR)' },
    ),
    closedKur(accidentalOmission, [gloss]),
    openedKur(intentionalOmission, [gloss]),
    closedKur(intentionalOmission, [gloss]),
    openedKur(removal, [gloss]),
    closedKur(removal, [gloss]),
    enclosure('DocumentOrientedGloss', ')}', 'RIGHT', {
      enclosureType: [gloss],
    }),
    enclosure('DocumentOrientedGloss', '{(', 'LEFT'),
    word(
      'KUR<(kur-kur)>',
      [
        logogram('KUR<(kur-kur)>', 'KUR', {
          enclosureType: [gloss],
          nameParts: [valueToken('KUR', { enclosureType: [gloss] })],
          surrogate: [
            reading('kur', 'kur'),
            joiner('-'),
            reading('kur', 'kur'),
          ],
        }),
      ],
      { enclosureType: [gloss] },
    ),
    word('kur', [enclosedKurReading([gloss])], { enclosureType: [gloss] }),
    enclosure('DocumentOrientedGloss', ')}', 'RIGHT', {
      enclosureType: [gloss],
    }),
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

export default line15

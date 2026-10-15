import { TextLine } from 'transliteration/domain/text-line'
import {
  enclosure,
  gloss,
  joiner,
  languageShift,
  logogram,
  reading,
  valueToken,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line10 = new TextLine({
  prefix: '6.',
  content: [
    word(
      '{d#-kur₂?}{d-RA!}kur',
      [
        gloss(
          'Determinative',
          '{d#-kur₂?}',
          [
            reading('d#', 'd', { cleanValue: 'd', flags: ['#'] }),
            joiner('-'),
            reading('kur₂?', 'kur', {
              cleanValue: 'kur₂',
              subIndex: 2,
              flags: ['?'],
            }),
          ],
          { cleanValue: '{d-kur₂}' },
        ),
        gloss(
          'Determinative',
          '{d-RA!}',
          [
            reading('d', 'd'),
            joiner('-'),
            logogram('RA!', 'RA', { cleanValue: 'RA', flags: ['!'] }),
          ],
          { cleanValue: '{d-RA}' },
        ),
        reading('kur', 'kur'),
      ],
      { cleanValue: '{d-kur₂}{d-RA}kur' },
    ),
    word('{{kur}}', [
      gloss('LinguisticGloss', '{{kur}}', [reading('kur', 'kur')]),
    ]),
    enclosure('DocumentOrientedGloss', '{(', 'LEFT'),
    word(
      'k[u]r{d!}',
      [
        reading('k[u]r', 'kur', {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'kur',
          nameParts: [
            valueToken('k', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
            enclosure('BrokenAway', '[', 'LEFT', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
            }),
            valueToken('u', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
            }),
            enclosure('BrokenAway', ']', 'RIGHT', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
            }),
            valueToken('r', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
          ],
        }),
        gloss(
          'Determinative',
          '{d!}',
          [
            reading('d!', 'd', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'd',
              nameParts: [
                valueToken('d', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
              ],
              flags: ['!'],
            }),
          ],
          { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'], cleanValue: '{d}' },
        ),
      ],
      { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'], cleanValue: 'kur{d}' },
    ),
    word(
      'KUR₂!-ra',
      [
        logogram('KUR₂!', 'KUR', {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'KUR₂',
          nameParts: [
            valueToken('KUR', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
          ],
          subIndex: 2,
          flags: ['!'],
        }),
        joiner('-', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
        reading('ra', 'ra', {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          nameParts: [
            valueToken('ra', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
          ],
        }),
      ],
      { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'], cleanValue: 'KUR₂-ra' },
    ),
    languageShift('%es', 'EMESAL', {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
    }),
    word(
      'kur{+k[ur]-RA}',
      [
        reading('kur', 'kur', {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          nameParts: [
            valueToken('kur', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
          ],
        }),
        gloss(
          'PhoneticGloss',
          '{+k[ur]-RA}',
          [
            reading('k[ur', 'kur', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'kur',
              nameParts: [
                valueToken('k', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
                enclosure('BrokenAway', '[', 'LEFT', {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                }),
                valueToken('ur', {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
                }),
              ],
            }),
            enclosure('BrokenAway', ']', 'RIGHT', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
            }),
            joiner('-', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
            logogram('RA', 'RA', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              nameParts: [
                valueToken('RA', {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                }),
              ],
            }),
          ],
          {
            enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
            cleanValue: '{+kur-RA}',
          },
        ),
      ],
      {
        enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
        cleanValue: 'kur{+kur-RA}',
        language: 'EMESAL',
        lemmatizable: false,
        alignable: false,
      },
    ),
    word(
      '{kur}kur₂',
      [
        gloss(
          'Determinative',
          '{kur}',
          [
            reading('kur', 'kur', {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              nameParts: [
                valueToken('kur', {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                }),
              ],
            }),
          ],
          { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] },
        ),
        reading('kur₂', 'kur', {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          nameParts: [
            valueToken('kur', { enclosureType: ['DOCUMENT_ORIENTED_GLOSS'] }),
          ],
          subIndex: 2,
        }),
      ],
      {
        enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
        language: 'EMESAL',
        lemmatizable: false,
        alignable: false,
      },
    ),
    enclosure('DocumentOrientedGloss', ')}', 'RIGHT', {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
    }),
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

export default line10

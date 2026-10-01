import { Token } from 'transliteration/domain/token'
import {
  gloss,
  joiner,
  languageShift,
  logogram,
  reading,
  word,
} from 'test-support/complex-text/tokenBuilders'

export default function languageShiftedTokens(
  shift: string,
  language: string,
): readonly Token[] {
  return [
    languageShift(shift, language),
    word(
      '|KUR₂.KUR|',
      [
        {
          enclosureType: [],
          cleanValue: '|KUR₂.KUR|',
          value: '|KUR₂.KUR|',
          type: 'CompoundGrapheme',
        },
      ],
      { language: language, lemmatizable: false, alignable: false },
    ),
    word(
      '{kur}ra/RA#-kur₂',
      [
        gloss('Determinative', '{kur}', [reading('kur', 'kur')]),
        {
          enclosureType: [],
          cleanValue: 'ra/RA',
          value: 'ra/RA#',
          tokens: [
            reading('ra', 'ra'),
            logogram('RA#', 'RA', { cleanValue: 'RA', flags: ['#'] }),
          ],
          type: 'Variant',
        },
        joiner('-'),
        reading('kur₂', 'kur', { subIndex: 2 }),
      ],
      {
        cleanValue: '{kur}ra/RA-kur₂',
        language: language,
        lemmatizable: false,
        alignable: false,
      },
    ),
    word(
      '{+kur}kur!',
      [
        gloss('PhoneticGloss', '{+kur}', [reading('kur', 'kur')]),
        reading('kur!', 'kur', { cleanValue: 'kur', flags: ['!'] }),
      ],
      {
        cleanValue: '{+kur}kur',
        language: language,
        lemmatizable: false,
        alignable: false,
      },
    ),
    {
      enclosureType: [],
      cleanValue: ':.',
      value: ':.',
      divider: ':.',
      modifiers: [],
      flags: [],
      type: 'Divider',
    },
    word(
      'kur/KUR#',
      [
        {
          enclosureType: [],
          cleanValue: 'kur/KUR',
          value: 'kur/KUR#',
          tokens: [
            reading('kur', 'kur'),
            logogram('KUR#', 'KUR', { cleanValue: 'KUR', flags: ['#'] }),
          ],
          type: 'Variant',
        },
      ],
      {
        cleanValue: 'kur/KUR',
        language: language,
        lemmatizable: false,
        alignable: false,
      },
    ),
  ]
}

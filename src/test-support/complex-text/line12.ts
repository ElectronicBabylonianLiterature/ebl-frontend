import { TextLine } from 'transliteration/domain/text-line'
import {
  gloss,
  languageShift,
  logogram,
  reading,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line12 = new TextLine({
  prefix: '2.',
  content: [
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
    word('kur', [reading('kur', 'kur')]),
    languageShift('%sux', 'SUMERIAN'),
    word(
      'kur{d}',
      [
        reading('kur', 'kur'),
        gloss('Determinative', '{d}', [reading('d', 'd')]),
      ],
      { language: 'SUMERIAN', lemmatizable: false, alignable: false },
    ),
    word('KUR', [logogram('KUR', 'KUR')], {
      language: 'SUMERIAN',
      lemmatizable: false,
      alignable: false,
    }),
    languageShift('%akk', 'AKKADIAN'),
    word('kur', [reading('kur', 'kur')]),
    languageShift('%es', 'EMESAL'),
    word('kur', [reading('kur', 'kur')], {
      language: 'EMESAL',
      lemmatizable: false,
      alignable: false,
    }),
    word(
      'KUR{D}',
      [
        logogram('KUR', 'KUR'),
        gloss('Determinative', '{D}', [logogram('D', 'D')]),
      ],
      { language: 'EMESAL', lemmatizable: false, alignable: false },
    ),
    languageShift('%akk', 'AKKADIAN'),
    word('kur', [reading('kur', 'kur')]),
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

export default line12

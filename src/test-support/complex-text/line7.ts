import { TextLine } from 'transliteration/domain/text-line'
import {
  joiner,
  logogram,
  reading,
  word,
} from 'test-support/complex-text/tokenBuilders'

const line7 = new TextLine({
  prefix: '4.',
  content: [
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation',
    },
    word(
      'kurₓ@v#!(KUR@v#?)-KUR₂@v#?<(kur-kur)>',
      [
        reading('kurₓ@v#!(KUR@v#?)', 'kur', {
          cleanValue: 'kurₓ@v(KUR@v#?)',
          subIndex: null,
          modifiers: ['@v'],
          flags: ['#', '!'],
          sign: {
            enclosureType: [],
            cleanValue: 'KUR@v',
            value: 'KUR@v#?',
            name: 'KUR',
            modifiers: ['@v'],
            flags: ['#', '?'],
            type: 'Grapheme',
          },
        }),
        joiner('-'),
        logogram('KUR₂@v#?<(kur-kur)>', 'KUR', {
          cleanValue: 'KUR₂@v<(kur-kur)>',
          subIndex: 2,
          modifiers: ['@v'],
          flags: ['#', '?'],
          surrogate: [
            reading('kur', 'kur'),
            joiner('-'),
            reading('kur', 'kur'),
          ],
        }),
      ],
      { cleanValue: 'kurₓ@v(KUR@v#?)-KUR₂@v<(kur-kur)>' },
    ),
  ],
  lineNumber: {
    number: 4,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line7

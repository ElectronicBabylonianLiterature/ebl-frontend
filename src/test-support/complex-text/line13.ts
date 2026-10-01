import { TextLine } from 'transliteration/domain/text-line'
import languageShiftedTokens from 'test-support/complex-text/languageShiftedTokens'

const line13 = new TextLine({
  prefix: '3.',
  content: languageShiftedTokens('%sux', 'SUMERIAN'),
  lineNumber: {
    number: 3,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line13

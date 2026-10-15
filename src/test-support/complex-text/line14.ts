import { TextLine } from 'transliteration/domain/text-line'
import languageShiftedTokens from 'test-support/complex-text/languageShiftedTokens'

const line14 = new TextLine({
  prefix: '4.',
  content: languageShiftedTokens('%es', 'EMESAL'),
  lineNumber: {
    number: 4,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line14

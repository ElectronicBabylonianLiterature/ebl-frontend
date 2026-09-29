import { TextLine } from 'transliteration/domain/text-line'
import { line12OpeningTokens } from 'test-support/complex-text/line12-opening-tokens'
import { line12ClosingTokens } from 'test-support/complex-text/line12-closing-tokens'

const line12 = new TextLine({
  prefix: '2.',
  content: [...line12OpeningTokens, ...line12ClosingTokens],
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

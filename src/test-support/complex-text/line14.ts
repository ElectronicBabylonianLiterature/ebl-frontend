import { TextLine } from 'transliteration/domain/text-line'
import { line14OpeningTokens } from 'test-support/complex-text/line14-opening-tokens'
import { line14ClosingTokens } from 'test-support/complex-text/line14-closing-tokens'

const line14 = new TextLine({
  prefix: '4.',
  content: [...line14OpeningTokens, ...line14ClosingTokens],
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

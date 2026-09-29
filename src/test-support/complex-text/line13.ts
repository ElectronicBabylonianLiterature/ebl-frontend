import { TextLine } from 'transliteration/domain/text-line'
import { line13OpeningTokens } from 'test-support/complex-text/line13-opening-tokens'
import { line13ClosingTokens } from 'test-support/complex-text/line13-closing-tokens'

const line13 = new TextLine({
  prefix: '3.',
  content: [...line13OpeningTokens, ...line13ClosingTokens],
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

import { TextLine } from 'transliteration/domain/text-line'
import { line10OpeningTokens } from 'test-support/complex-text/line10-opening-tokens'
import { line10MiddleTokens } from 'test-support/complex-text/line10-middle-tokens'
import { line10ClosingTokens } from 'test-support/complex-text/line10-closing-tokens'

const line10 = new TextLine({
  prefix: '6.',
  content: [
    ...line10OpeningTokens,
    ...line10MiddleTokens,
    ...line10ClosingTokens,
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

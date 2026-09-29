import { TextLine } from 'transliteration/domain/text-line'
import { line15OpeningTokens } from 'test-support/complex-text/line15-opening-tokens'
import { line15EarlyTokens } from 'test-support/complex-text/line15-early-tokens'
import { line15LateTokens } from 'test-support/complex-text/line15-late-tokens'
import { line15ClosingTokens } from 'test-support/complex-text/line15-closing-tokens'

const line15 = new TextLine({
  prefix: '5.',
  content: [
    ...line15OpeningTokens,
    ...line15EarlyTokens,
    ...line15LateTokens,
    ...line15ClosingTokens,
  ],
  lineNumber: {
    number: 5,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

export default line15

import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'

const defaultPrime = '′'
const defaultRangeSeparator = '–'
const atfPrime = "'"
const atfRangeSeparator = '-'
const prefixSeparator = '+'

function formatLineNumberRange(
  { start, end }: LineNumberRange,
  rangeSeparator: string,
  prime: string,
): string {
  return `${formatLineNumber(start, prime)}${rangeSeparator}${formatLineNumber(
    end,
    prime,
  )}`
}

function formatLineNumber(
  { hasPrime, number, prefixModifier, suffixModifier }: LineNumber,
  prime: string,
): string {
  const prefix = prefixModifier ? prefixModifier + prefixSeparator : ''
  const prime_ = hasPrime ? prime : ''
  const suffix = suffixModifier ? suffixModifier : ''
  return `${prefix}${number}${prime_}${suffix}`
}

export default function lineNumberToString(
  lineNumber: LineNumber | LineNumberRange,
  prime = defaultPrime,
  rangeSeparator = defaultRangeSeparator,
): string {
  return lineNumber.type === 'LineNumberRange'
    ? formatLineNumberRange(lineNumber, rangeSeparator, prime)
    : formatLineNumber(lineNumber, prime)
}

export function lineNumberToAtf(
  lineNumber: LineNumber | LineNumberRange,
): string {
  return lineNumberToString(lineNumber, atfPrime, atfRangeSeparator)
}

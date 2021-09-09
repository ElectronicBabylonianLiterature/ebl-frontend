import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'

function formatLineNumberRange({ start, end }: LineNumberRange): string {
  return `${formatLineNumber(start)}–${formatLineNumber(end)}`
}

function formatLineNumber({
  hasPrime,
  number,
  prefixModifier,
  suffixModifier,
}: LineNumber): string {
  const prefix = prefixModifier ? prefixModifier + '+' : ''
  const prime = hasPrime ? '′' : ''
  const suffix = suffixModifier ? suffixModifier : ''
  return `${prefix}${number}${prime}${suffix}`
}

export default function lineNumberToString(
  lineNumber: LineNumber | LineNumberRange
): string {
  return lineNumber.type === 'LineNumberRange'
    ? formatLineNumberRange(lineNumber)
    : formatLineNumber(lineNumber)
}

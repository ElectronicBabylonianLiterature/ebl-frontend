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

const lineNumberTypeToFunction = {
  LineNumber: formatLineNumber,
  LineNumberRange: formatLineNumberRange,
}

export default function lineNumberToString(
  lineNumber: LineNumber | LineNumberRange
): string {
  const createFormattedLineNumbers =
    lineNumberTypeToFunction[lineNumber.type as string]
  return createFormattedLineNumbers(lineNumber)
}

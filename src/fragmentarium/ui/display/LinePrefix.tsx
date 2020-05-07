import { Line } from 'fragmentarium/domain/line'
import { LineNumber, LineNumberRange } from 'fragmentarium/domain/line-number'
import React from 'react'
import { isTextLine } from './type-guards'

function formatLineNumberRange({ start, end }: LineNumberRange): string {
  return `${formatLineNumber(start)}-${formatLineNumber(end)}`
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

function lineNumberToString(lineNumber: LineNumber | LineNumberRange): string {
  const createFormattedLineNumbers =
    lineNumberTypeToFunction[lineNumber.type as string]
  return createFormattedLineNumbers(lineNumber)
}

export function LinePrefix({ line }: { line: Line }): JSX.Element {
  return isTextLine(line) ? (
    <sup>({lineNumberToString(line.lineNumber)})</sup>
  ) : (
    <span>{line.prefix}</span>
  )
}

import { Line } from '../../domain/line'
import { LineNumber, LineNumberRange } from '../../domain/line-number'
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
  const prefixMod = prefixModifier ? prefixModifier + '+' : ''
  const prime = hasPrime ? '′' : ''
  const suffixMod = suffixModifier ? suffixModifier : ''
  return `${prefixMod}${number}${prime}${suffixMod}`
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

export function TextLinePrefix({ line }: { line: Line }): JSX.Element {
  if (isTextLine(line)) {
    return <sup>({lineNumberToString(line.lineNumber)})</sup>
  } else {
    return <span>{line.prefix}</span>
  }
}

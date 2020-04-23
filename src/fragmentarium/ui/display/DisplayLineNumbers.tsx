import { Line, LineNumber, LineNumberRange, TextLine } from '../../domain/text'
import React from 'react'

function formatLineNumberRange({ start, end }: LineNumberRange): string {
  return `${formatLineNumber(start)}-${formatLineNumber(end)}`
}
function formatLineNumber({
  hasPrime,
  number,
  prefixModifier,
  suffixModifier
}: LineNumber): string {
  const prefixMod = prefixModifier ? prefixModifier + '+' : ''
  const prime = hasPrime ? '′' : ''
  const suffixMod = suffixModifier ? suffixModifier : ''
  return `${prefixMod}${number}${prime}${suffixMod}`
}

const lineNumberTypeToFunction = {
  LineNumber: formatLineNumber,
  LineNumberRange: formatLineNumberRange
}
function lineNumberToString(lineNumber: LineNumber | LineNumberRange): string {
  const createFormattedLineNumbers =
    lineNumberTypeToFunction[lineNumber.type as string]
  return createFormattedLineNumbers(lineNumber)
}

export function DisplayPrefix({ line }: { line: Line }): JSX.Element {
  if (line.type === 'TextLine') {
    const textLine = line as TextLine
    return <sup>({lineNumberToString(textLine.lineNumber)})</sup>
  } else {
    return <span>{line.prefix}</span>
  }
}

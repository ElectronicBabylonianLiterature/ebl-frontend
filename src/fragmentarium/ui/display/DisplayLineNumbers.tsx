import { Line, LineNumber, LineNumberRange, TextLine } from '../../domain/text'
import React from 'react'

function formatLineNumber(lineNumber: LineNumber): string {
  return `(${lineNumberToString(lineNumber)})`
}

function formatLineNumberRange({ start, end }: LineNumberRange): string {
  return `(${lineNumberToString(start)}-${lineNumberToString(end)})`
}
function lineNumberToString({
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

const lineNumberTypeToComponent = {
  LineNumber: formatLineNumber,
  LineNumberRange: formatLineNumberRange
}
function chooseLineNumberType(
  lineNumber: LineNumber | LineNumberRange
): string {
  const lineNumberComponent =
    lineNumberTypeToComponent[lineNumber.type as string]
  return lineNumberComponent(lineNumber)
}

export default function DisplayLineNumber({
  line
}: {
  line: Line
}): JSX.Element {
  if (line.type === 'TextLine') {
    const textLine = line as TextLine
    return <sup>{chooseLineNumberType(textLine.lineNumber)}</sup>
  } else {
    return <span key="prefix">{line.prefix}</span>
  }
}

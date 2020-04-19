import React, { FunctionComponent } from 'react'
import classNames from 'classnames'
import {
  Line,
  Text,
  DollarAndAtLine,
  RulingDollarLine,
  TextLine,
  LineNumber,
  LineNumberRange
} from 'fragmentarium/domain/text'
import DisplayLineTokens from './LineAccumulator'
import './Display.sass'

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
function DisplayLineNumber({
  lineNumber
}: {
  lineNumber: LineNumber | LineNumberRange
}): JSX.Element {
  const lineNumberComponent =
    lineNumberTypeToComponent[lineNumber.type as string]
  return <sup>{lineNumberComponent(lineNumber)}</sup>
}

function DisplayTextLine({
  line,
  line: { type, content },
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const textLine = line as TextLine
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${type}`]) },
    <DisplayLineNumber lineNumber={textLine.lineNumber} />,
    <DisplayLineTokens content={content} />
  )
}

function DisplayLine({
  line: { type, prefix, content },
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${type}`]) },
    <span key="prefix">{prefix}</span>,
    <DisplayLineTokens content={content} />
  )
}

const rulingsToNumber: ReadonlyMap<string, number> = new Map([
  ['SINGLE', 1],
  ['DOUBLE', 2],
  ['TRIPLE', 3]
])

function DisplayDollarAndAtLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return React.createElement(
    container,
    { className: 'Transliteration__DollarAndAtLine' },
    `(${dollarAndAtLine.displayValue})`
  )
}

function DisplayDollarAndAtLineWithParenthesis({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return React.createElement(
    container,
    { className: 'Transliteration__DollarAndAtLineWithParenthesis' },
    dollarAndAtLine.displayValue
  )
}

const lineComponents: ReadonlyMap<
  string,
  FunctionComponent<{
    line: Line
    container?: string
  }>
> = new Map([
  ['ControlLine', DisplayLine],
  ['TextLine', DisplayTextLine],
  ['RulingDollarLine', DisplayRulingDollarLine],
  ['LooseDollarLine', DisplayDollarAndAtLineWithParenthesis],
  ['ImageDollarLine', DisplayDollarAndAtLineWithParenthesis],
  ['SealDollarLine', DisplayDollarAndAtLine],
  ['StateDollarLine', DisplayDollarAndAtLine],
  ['SealAtLine', DisplayDollarAndAtLine],
  ['ColumnAtLine', DisplayDollarAndAtLine],
  ['HeadingAtLine', DisplayDollarAndAtLine],
  ['DiscourseAtLine', DisplayDollarAndAtLine],
  ['SurfaceAtLine', DisplayDollarAndAtLine],
  ['ObjectAtLine', DisplayDollarAndAtLine],
  ['DivisionAtLine', DisplayDollarAndAtLine],
  ['CompositeAtLine', DisplayDollarAndAtLine]
])

function DisplayRulingDollarLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const rulingLine = line as RulingDollarLine
  const rulingType = `Transliteration__ruling`
  const rulingsNumber = rulingsToNumber.get(rulingLine.number) as number
  return React.createElement(
    container,
    { className: 'Transliteration__RulingDollarLine' },
    [...Array(rulingsNumber).keys()].map((value: number) => {
      return <DisplayEachRuling key={value} rulingType={rulingType} />
    })
  )
}

function DisplayEachRuling({
  rulingType
}: {
  rulingType: string
}): JSX.Element {
  return <div className={rulingType} />
}

export function Transliteration({
  text: { lines }
}: {
  text: Text
}): JSX.Element {
  return (
    <ol className="Transliteration">
      {lines.map((line: Line, index: number) => {
        const LineComponent = lineComponents.get(line.type) || DisplayLine
        return <LineComponent key={index} container="li" line={line} />
      })}
    </ol>
  )
}

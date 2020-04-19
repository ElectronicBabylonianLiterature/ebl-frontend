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

function DisplayLineNumber({
  lineNumber
}: {
  lineNumber: LineNumber
}): JSX.Element {
  return <sup>{`(${lineNumberToString(lineNumber)})`}</sup>
}

function DisplayLineNumberRange({
  lineNumber: { start, end }
}: {
  lineNumber: LineNumberRange
}): JSX.Element {
  return (
    <sup>{`(${lineNumberToString(start)}-${lineNumberToString(end)})`}</sup>
  )
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
  LineNumber: DisplayLineNumber,
  LineNumberRange: DisplayLineNumberRange
}

function DisplayTextLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const textLine = line as TextLine
  const LineNumberComponent =
    lineNumberTypeToComponent[textLine.lineNumber.type as string]
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${textLine.type}`]) },
    <LineNumberComponent key={0} lineNumber={textLine.lineNumber} />,
    <DisplayLineTokens content={textLine.content} />
  )
}

function DisplayLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${line.type}`]) },
    <span key="prefix">{line.prefix}</span>,
    <DisplayLineTokens content={line.content} />
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

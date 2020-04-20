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
import './Display.sass'
import DisplayLineTokens from './DisplayLineTokens'
import _ from 'lodash'

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
function displayLineNumber(lineNumber: LineNumber | LineNumberRange): string {
  const lineNumberComponent =
    lineNumberTypeToComponent[lineNumber.type as string]
  return lineNumberComponent(lineNumber)
}

function DisplayLinePrefix({ line }: { line: Line }): JSX.Element {
  if (line.type === 'TextLine') {
    const textLine = line as TextLine
    return <sup>{displayLineNumber(textLine.lineNumber)}</sup>
  } else {
    return <span key="prefix">{line.prefix}</span>
  }
}

function DisplayLine({
  line,
  line: { type, content },
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${type}`]) },
    <DisplayLinePrefix line={line} />,
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
  ['TextLine', DisplayLine],
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
    _.range(0, rulingsNumber).map((value: number) => {
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

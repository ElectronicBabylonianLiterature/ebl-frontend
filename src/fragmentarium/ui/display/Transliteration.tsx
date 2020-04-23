import React, { FunctionComponent } from 'react'
import classNames from 'classnames'
import {
  Line,
  Text,
  DollarAndAtLine,
  RulingDollarLine
} from 'fragmentarium/domain/text'
import './Display.sass'
import _ from 'lodash'
import LineTokens from './LineTokens'
import { TextLinePrefix } from './DisplayLineNumbers'

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
    <TextLinePrefix line={line} />,
    <LineTokens content={content} />
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

const rulingsToNumber: ReadonlyMap<string, number> = new Map([
  ['SINGLE', 1],
  ['DOUBLE', 2],
  ['TRIPLE', 3]
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

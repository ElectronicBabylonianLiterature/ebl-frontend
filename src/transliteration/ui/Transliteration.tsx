import classNames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'
import {
  DollarAndAtLine,
  Line,
  NoteLine,
  NoteLinePart,
  RulingDollarLine,
  TextPart,
} from 'transliteration/domain/line'
import { Text } from 'transliteration/domain/text'
import { isLanguagePart } from '../domain/type-guards'
import { LinePrefix } from './LinePrefix'
import LineTokens from './LineTokens'
import './Transliteration.sass'

function DisplayLine({
  line,
  line: { type, content },
  container = 'div',
}: {
  line: Line
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${type}`]) },
    <LinePrefix line={line} />,
    <LineTokens content={content} />
  )
}

function DisplayDollarAndAtLineWithParenthesis({
  line,
  container = 'div',
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
  container = 'div',
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

function DispalyTextPart({
  part: { type, text },
}: {
  part: TextPart
}): JSX.Element {
  return type === 'EmphasisPart' ? <em>{text}</em> : <span>{text}</span>
}

function DisplayNoteLine({
  line,
  container = 'div',
}: {
  line: NoteLine
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${line.type}`]) },
    line.parts.map((part: NoteLinePart, index: number) =>
      isLanguagePart(part) ? (
        <LineTokens
          key={index}
          content={[
            {
              enclosureType: [],
              cleanValue: '',
              value: '',
              language: part.language,
              normalized: false,
              type: 'LanguageShift',
            },
            ...part.tokens,
          ]}
        />
      ) : (
        <DispalyTextPart key={index} part={part} />
      )
    )
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
  ['CompositeAtLine', DisplayDollarAndAtLine],
])

function Ruling(): JSX.Element {
  return <div className="Transliteration__ruling" />
}

const rulingsToNumber: ReadonlyMap<string, number> = new Map([
  ['SINGLE', 1],
  ['DOUBLE', 2],
  ['TRIPLE', 3],
])

function DisplayRulingDollarLine({
  line,
  container = 'div',
}: {
  line: Line
  container?: string
}): JSX.Element {
  const rulingLine = line as RulingDollarLine
  const rulingsNumber = rulingsToNumber.get(rulingLine.number) as number
  return React.createElement(
    container,
    { className: 'Transliteration__RulingDollarLine' },
    _.range(0, rulingsNumber).map((number: number) => {
      return <Ruling key={number} />
    })
  )
}

export function Transliteration({ text }: { text: Text }): JSX.Element {
  return (
    <>
      <ol className="Transliteration">
        {text.lines.map((line: Line, index: number) => {
          const LineComponent = lineComponents.get(line.type) || DisplayLine
          return <LineComponent key={index} container="li" line={line} />
        })}
      </ol>
      <ol className="Transliteration">
        {Array.from(text.notes).flatMap(([number, lines]) =>
          lines.map((line, index) => (
            <DisplayNoteLine
              key={`${number}-${index}`}
              container="li"
              line={line}
            />
          ))
        )}
      </ol>
    </>
  )
}

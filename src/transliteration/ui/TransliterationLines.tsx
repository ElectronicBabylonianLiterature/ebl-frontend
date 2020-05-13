import classNames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'
import {
  DollarAndAtLine,
  Line,
  RulingDollarLine,
} from 'transliteration/domain/line'
import { Text, Notes } from 'transliteration/domain/text'
import { LinePrefix } from './LinePrefix'
import LineTokens from './LineTokens'
import { NoteLinks, createLineId } from './note-links'

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

function FirstLineNotes({ notes }: { notes: Notes }): JSX.Element {
  const hasNotes = !_.isEmpty(notes.get(0))
  return (
    <>
      {hasNotes && (
        <li id={createLineId(0)}>
          <NoteLinks notes={notes} lineNumber={0} />
        </li>
      )}
    </>
  )
}

function TransliterationLine({
  line,
  notes,
  index,
}: {
  line: Line
  notes: Notes
  index: number
}): JSX.Element {
  const LineComponent = lineComponents.get(line.type) || DisplayLine
  const lineNumber = index + 1
  return (
    <li id={createLineId(lineNumber)}>
      <LineComponent container="span" line={line} />{' '}
      <NoteLinks notes={notes} lineNumber={lineNumber} />
    </li>
  )
}

export default function TransliterationLines({
  text,
}: {
  text: Text
}): JSX.Element {
  return (
    <ol className="Transliteration__lines">
      <FirstLineNotes notes={text.notes} />
      {text.lines.map((line: Line, index: number) => (
        <TransliterationLine
          key={index}
          line={line}
          notes={text.notes}
          index={index}
        />
      ))}
    </ol>
  )
}

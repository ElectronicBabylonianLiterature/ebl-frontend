import classNames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'
import {
  DollarAndAtLine,
  Line,
  RulingDollarLine,
  TextLine,
} from 'transliteration/domain/line'
import { Text, Notes } from 'transliteration/domain/text'
import { LinePrefix } from './LinePrefix'
import LineTokens from './LineTokens'
import { NoteLinks, createLineId } from './note-links'

function DisplayControlLine({
  line: { type, prefix, content },
}: {
  line: Line
}): JSX.Element {
  return (
    <>
      <td className={classNames([`Transliteration__${type}`])}>{prefix}</td>
      <td className={classNames([`Transliteration__${type}`])}>
        {content.map(({ value }) => value).join('')}
      </td>
    </>
  )
}

function DisplayTextLine({
  line,
  line: { type, content },
}: {
  line: Line
}): JSX.Element {
  return (
    <>
      <td className={classNames([`Transliteration__${type}`])}>
        <LinePrefix line={line as TextLine} />
      </td>
      <td className={classNames([`Transliteration__${type}`])}>
        <LineTokens content={content} />
      </td>
    </>
  )
}

function DisplayDollarAndAtLineWithParenthesis({
  line,
}: {
  line: Line
}): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return (
    <>
      <td></td>
      <td className="Transliteration__DollarAndAtLineWithParenthesis">
        {dollarAndAtLine.displayValue}
      </td>
    </>
  )
}

function DisplayDollarAndAtLine({ line }: { line: Line }): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return (
    <>
      <td></td>
      <td className="Transliteration__DollarAndAtLine">
        (${dollarAndAtLine.displayValue})
      </td>
    </>
  )
}

const lineComponents: ReadonlyMap<
  string,
  FunctionComponent<{
    line: Line
  }>
> = new Map([
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

function DisplayRulingDollarLine({ line }: { line: Line }): JSX.Element {
  const rulingLine = line as RulingDollarLine
  const rulingsNumber = rulingsToNumber.get(rulingLine.number) as number
  return (
    <>
      <td></td>
      <td className="Transliteration__RulingDollarLine">
        {_.range(0, rulingsNumber).map((number: number) => {
          return <Ruling key={number} />
        })}
      </td>
    </>
  )
}

function FirstLineNotes({ notes }: { notes: Notes }): JSX.Element {
  const hasNotes = !_.isEmpty(notes.get(0))
  return (
    <>
      {hasNotes && (
        <tr id={createLineId(0)}>
          <td></td>
          <td></td>
          <td>
            <NoteLinks notes={notes} lineNumber={0} />
          </td>
        </tr>
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
  const LineComponent = lineComponents.get(line.type) || DisplayControlLine
  const lineNumber = index + 1
  return (
    <tr id={createLineId(lineNumber)}>
      <LineComponent line={line} />
      <td>
        <NoteLinks notes={notes} lineNumber={lineNumber} />
      </td>
    </tr>
  )
}

export default function TransliterationLines({
  text,
}: {
  text: Text
}): JSX.Element {
  return (
    <table className="Transliteration__lines">
      <FirstLineNotes notes={text.notes} />
      {text.lines.map((line: Line, index: number) => (
        <TransliterationLine
          key={index}
          line={line}
          notes={text.notes}
          index={index}
        />
      ))}
    </table>
  )
}

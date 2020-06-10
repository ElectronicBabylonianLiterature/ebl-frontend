import classNames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'
import { DollarAndAtLine, Line } from 'transliteration/domain/line'
import { Text, Notes } from 'transliteration/domain/text'
import { NoteLinks, createLineId } from './note-links'
import DisplayRulingDollarLine from './rulings'
import DisplayTextLine from './text-line'

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

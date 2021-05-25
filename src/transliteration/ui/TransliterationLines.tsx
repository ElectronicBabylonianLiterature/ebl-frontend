import classNames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'
import { Text, Notes } from 'transliteration/domain/text'
import { NoteLinks, createLineId } from './note-links'
import DisplayRulingDollarLine from './rulings'
import DisplayTextLine from './text-line'
import { DisplayDollarAndAtLine } from './dollar-and-at-lines'
import { LineProps } from './LineProps'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import TranslationLine, {
  Extent,
} from 'transliteration/domain/translation-line'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

function DisplayControlLine({
  line: { type, prefix, content },
  columns,
}: LineProps): JSX.Element {
  return (
    <>
      <td className={classNames([`Transliteration__${type}`])}>{prefix}</td>
      <td
        colSpan={columns}
        className={classNames([`Transliteration__${type}`])}
      >
        {content.map(({ value }) => value).join('')}
      </td>
    </>
  )
}

function DispalyExtent({ extent }: { extent: Extent }): JSX.Element {
  const labels = extent.labels.join(' ')
  return (
    <>
      ({labels}
      {!_.isEmpty(labels) && ' '}
      {lineNumberToString(extent.number)})
    </>
  )
}

function DisplayTranslationLine({ line, columns }: LineProps): JSX.Element {
  const translationLine = line as TranslationLine
  return (
    <>
      <td className={classNames([`Transliteration__${line.type}`])}>
        {translationLine.language}
        {translationLine.extent && (
          <>
            {' '}
            <DispalyExtent extent={translationLine.extent} />
          </>
        )}
        :
      </td>
      <td
        colSpan={columns}
        className={classNames([`Transliteration__${line.type}`])}
      >
        <Markup line={translationLine} />
      </td>
    </>
  )
}

const lineComponents: ReadonlyMap<
  string,
  FunctionComponent<LineProps>
> = new Map([
  ['TextLine', DisplayTextLine],
  ['RulingDollarLine', DisplayRulingDollarLine],
  ['LooseDollarLine', DisplayDollarAndAtLine],
  ['ImageDollarLine', DisplayDollarAndAtLine],
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
  ['TranslationLine', DisplayTranslationLine],
])

function FirstLineNotes({
  notes,
  columns,
}: {
  notes: Notes
  columns: number
}): JSX.Element {
  const hasNotes = !_.isEmpty(notes.get(0))
  return (
    <>
      {hasNotes && (
        <tr id={createLineId(0)}>
          <td></td>
          <td colSpan={columns}></td>
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
  columns,
}: {
  line: AbstractLine
  notes: Notes
  index: number
  columns: number
}): JSX.Element {
  const LineComponent = lineComponents.get(line.type) || DisplayControlLine
  const lineNumber = index + 1
  return (
    <tr id={createLineId(lineNumber)}>
      <LineComponent line={line} columns={columns} />
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
      <tbody>
        <FirstLineNotes notes={text.notes} columns={text.numberOfColumns} />
        {text.lines.map((line: AbstractLine, index: number) => (
          <TransliterationLine
            key={index}
            line={line}
            notes={text.notes}
            index={index}
            columns={text.numberOfColumns}
          />
        ))}
      </tbody>
    </table>
  )
}

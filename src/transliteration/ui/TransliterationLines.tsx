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
import { SurfaceLabel } from 'transliteration/domain/labels'
import { isSurfaceAtLine } from 'transliteration/domain/type-guards'

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
        <Markup parts={translationLine.parts} />
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
  surface,
}: {
  line: AbstractLine
  notes: Notes
  index: number
  columns: number
  surface: SurfaceLabel | null
}): JSX.Element {
  const LineComponent = lineComponents.get(line.type) || DisplayControlLine
  const lineNumber = index + 1
  return (
    <tr id={createLineId(lineNumber)}>
      <LineComponent line={line} columns={columns} surface={surface} />
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
  const numberOfColumns = text.numberOfColumns
  return (
    <table className="Transliteration__lines">
      <tbody>
        <FirstLineNotes notes={text.notes} columns={numberOfColumns} />
        {
          text.lines.reduce<[JSX.Element[], SurfaceLabel | null]>(
            (
              [elements, surface]: [JSX.Element[], SurfaceLabel | null],
              line: AbstractLine,
              index: number
            ) => {
              const currentSurface = isSurfaceAtLine(line)
                ? line.label
                : surface
              return [
                [
                  ...elements,
                  <TransliterationLine
                    key={index}
                    line={line}
                    notes={text.notes}
                    index={index}
                    columns={numberOfColumns}
                    surface={currentSurface}
                  />,
                ],
                currentSurface,
              ]
            },
            [[], null]
          )[0]
        }
      </tbody>
    </table>
  )
}

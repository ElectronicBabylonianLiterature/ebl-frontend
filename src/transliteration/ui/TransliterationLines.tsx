import _ from 'lodash'
import React, { FunctionComponent } from 'react'
import { Text, Notes } from 'transliteration/domain/text'
import { NoteLinks, createLineId } from './note-links'
import DisplayRulingDollarLine from './rulings'
import DisplayTextLine from './text-line'
import { DisplayDollarAndAtLine } from './dollar-and-at-lines'
import { LineProps } from './LineProps'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import {
  isColumnAtLine,
  isObjectAtLine,
  isSurfaceAtLine,
} from 'transliteration/domain/type-guards'
import DisplayTranslationLine from './DisplayTranslationLine'
import DisplayControlLine from './DisplayControlLine'
import { DisplayParallelLine } from './parallel-line'

export const lineComponents: ReadonlyMap<
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
  ['ParallelFragment', DisplayParallelLine],
  ['ParallelText', DisplayParallelLine],
  ['ParallelComposition', DisplayParallelLine],
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
  labels,
  activeLine,
}: {
  line: AbstractLine
  notes: Notes
  index: number
  columns: number
  labels: Labels
  activeLine: string
}): JSX.Element {
  const LineComponent = lineComponents.get(line.type) || DisplayControlLine
  const lineNumber = index + 1
  return (
    <tr id={createLineId(lineNumber)}>
      <LineComponent
        line={line}
        columns={columns}
        labels={labels}
        activeLine={activeLine}
      />
      <td>
        <NoteLinks notes={notes} lineNumber={lineNumber} />
      </td>
    </tr>
  )
}

function getCurrentLabels(labels: Labels, line: AbstractLine): Labels {
  if (isObjectAtLine(line)) {
    return { ...labels, object: line.label }
  } else if (isSurfaceAtLine(line)) {
    return { ...labels, surface: line.label }
  } else if (isColumnAtLine(line)) {
    return { ...labels, column: line.label }
  } else {
    return labels
  }
}

export function DisplayText({
  text,
  activeLine = '',
}: {
  text: Text
  activeLine?: string
}): JSX.Element {
  return (
    <>
      {
        text.lines.reduce<[JSX.Element[], Labels]>(
          (
            [elements, labels]: [JSX.Element[], Labels],
            line: AbstractLine,
            index: number
          ) => {
            const currentLabels = getCurrentLabels(labels, line)
            return [
              [
                ...elements,
                <TransliterationLine
                  key={index}
                  line={line}
                  notes={text.notes}
                  index={index}
                  columns={text.numberOfColumns}
                  labels={currentLabels}
                  activeLine={activeLine}
                />,
              ],
              currentLabels,
            ]
          },
          [[], defaultLabels]
        )[0]
      }
    </>
  )
}

export default function TransliterationLines({
  text,
  activeLine = '',
}: {
  text: Text
  activeLine?: string
}): JSX.Element {
  const numberOfColumns = text.numberOfColumns
  return (
    <table className="Transliteration__lines">
      <tbody>
        <FirstLineNotes notes={text.notes} columns={numberOfColumns} />
        <DisplayText text={text} activeLine={activeLine} />
      </tbody>
    </table>
  )
}

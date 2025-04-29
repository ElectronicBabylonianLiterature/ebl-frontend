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
import TranslationColumn from 'transliteration/ui/TranslationColumn'

export type LineComponentMap = ReadonlyMap<string, FunctionComponent<LineProps>>

export const defaultLineComponents: LineComponentMap = new Map([
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

export function getCurrentLabels(labels: Labels, line: AbstractLine): Labels {
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

export type TranslationStyle = 'inline' | 'standoff'

function DisplayText({
  text,
  translationStyle = 'inline',
  activeLine = '',
  translationLanguage,
}: {
  text: Text
  translationStyle?: TranslationStyle
  activeLine?: string
  translationLanguage: string | null
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
            const LineComponent =
              defaultLineComponents.get(line.type) || DisplayControlLine
            const lineNumber = index + 1
            const skipLine =
              line.type === 'TranslationLine' && translationStyle === 'standoff'
            const showTranslationColumn =
              translationStyle === 'standoff' && translationLanguage
            const translationOffset =
              line.type === 'RulingDollarLine' && showTranslationColumn ? 2 : 0
            const rows = skipLine
              ? elements
              : [
                  ...elements,
                  <tr id={createLineId(lineNumber)} key={index}>
                    <LineComponent
                      line={line}
                      lineIndex={index}
                      columns={text.numberOfColumns + translationOffset}
                      labels={labels}
                      activeLine={activeLine}
                    />
                    <td>
                      <NoteLinks notes={text.notes} lineNumber={lineNumber} />
                    </td>
                    {showTranslationColumn && (
                      <TranslationColumn
                        lines={text.lines}
                        lineIndex={index}
                        language={translationLanguage}
                      />
                    )}
                  </tr>,
                ]
            return [rows, getCurrentLabels(labels, line)]
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
  translationStyle = 'inline',
  translationLanguage = null,
}: {
  text: Text
  activeLine?: string
  translationStyle?: TranslationStyle
  translationLanguage?: string | null
}): JSX.Element {
  return (
    <table className="Transliteration__lines">
      <tbody>
        <FirstLineNotes notes={text.notes} columns={text.numberOfColumns} />
        <DisplayText
          text={text}
          activeLine={activeLine}
          translationStyle={translationStyle}
          translationLanguage={translationLanguage}
        />
      </tbody>
    </table>
  )
}

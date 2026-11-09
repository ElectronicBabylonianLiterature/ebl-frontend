import _ from 'lodash'
import React, { FunctionComponent, PropsWithChildren, useMemo } from 'react'
import { Text, Notes } from 'transliteration/domain/text'
import { NoteLinks, createLineId } from 'transliteration/ui/note-links'
import DisplayRulingDollarLine from 'transliteration/ui/rulings'
import DisplayTextLine, { createTextLineId } from 'transliteration/ui/text-line'
import { DisplayDollarAndAtLine } from 'transliteration/ui/dollar-and-at-lines'
import { LineProps } from 'transliteration/ui/LineProps'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import {
  isColumnAtLine,
  isSealAtLine,
  isObjectAtLine,
  isSurfaceAtLine,
  isTextLine,
  isTranslationLine,
} from 'transliteration/domain/type-guards'
import DisplayTranslationLine from 'transliteration/ui/DisplayTranslationLine'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { DisplayParallelLine } from 'transliteration/ui/parallel-line'
import TranslationColumn from 'transliteration/ui/TranslationColumn'

export type LineComponentMap = ReadonlyMap<string, FunctionComponent<LineProps>>
interface TextDisplayProps {
  text: Text
  activeLine?: string
  matchLegacyLineIds: boolean
  language: string | null
}

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

function clearSeal(labels: Labels): Labels {
  return labels.sealNumber == null ? labels : { ...labels, sealNumber: null }
}

export function getCurrentLabels(labels: Labels, line: AbstractLine): Labels {
  if (isObjectAtLine(line)) {
    return { ...clearSeal(labels), object: line.label }
  } else if (isSurfaceAtLine(line)) {
    return { ...clearSeal(labels), surface: line.label }
  } else if (isColumnAtLine(line)) {
    return { ...clearSeal(labels), column: line.label }
  } else if (isSealAtLine(line)) {
    return { ...labels, sealNumber: line.number }
  } else {
    return labels
  }
}

function hasTextLineWithId(
  lines: readonly AbstractLine[],
  lineId: string,
): boolean {
  let labels = defaultLabels
  for (const line of lines) {
    if (isTextLine(line) && createTextLineId(labels, line) === lineId) {
      return true
    }
    labels = getCurrentLabels(labels, line)
  }
  return false
}

export type TranslationStyle = 'inline' | 'standoff'

function DisplayRow({
  line,
  lineIndex,
  columns,
  labels,
  activeLine,
  matchLegacyLineIds,
  notes,
  children,
}: PropsWithChildren<
  LineProps & {
    lineIndex: number
    notes: Notes
  }
>): JSX.Element {
  const LineComponent =
    defaultLineComponents.get(line.type) || DisplayControlLine
  const lineNumber = lineIndex + 1
  return (
    <tr id={createLineId(lineNumber)}>
      <LineComponent
        line={line}
        lineIndex={lineIndex}
        columns={columns}
        labels={labels}
        activeLine={activeLine}
        matchLegacyLineIds={matchLegacyLineIds}
      />
      <td>
        <NoteLinks notes={notes} lineNumber={lineNumber} />
      </td>
      {children}
    </tr>
  )
}

function skipLine(line: AbstractLine, language: string | null): boolean {
  return !!language && isTranslationLine(line) && line.language !== language
}

function DisplaySingleColumnText({
  text,
  activeLine,
  matchLegacyLineIds,
  language,
}: TextDisplayProps): JSX.Element {
  return (
    <>
      {
        text.lines.reduce<[JSX.Element[], Labels]>(
          (
            [elements, labels]: [JSX.Element[], Labels],
            line: AbstractLine,
            index: number,
          ) => {
            const rows = skipLine(line, language)
              ? elements
              : [
                  ...elements,
                  <DisplayRow
                    key={index}
                    line={line}
                    lineIndex={index}
                    columns={text.numberOfColumns}
                    labels={labels}
                    activeLine={activeLine}
                    matchLegacyLineIds={matchLegacyLineIds}
                    notes={text.notes}
                  />,
                ]
            return [rows, getCurrentLabels(labels, line)]
          },
          [[], defaultLabels],
        )[0]
      }
    </>
  )
}
function DisplayTwoColumnText({
  text,
  activeLine,
  matchLegacyLineIds,
  language,
}: TextDisplayProps): JSX.Element {
  return (
    <>
      {
        text.lines.reduce<[JSX.Element[], Labels]>(
          (
            [elements, labels]: [JSX.Element[], Labels],
            line: AbstractLine,
            index: number,
          ) => {
            const rows = isTranslationLine(line)
              ? elements
              : [
                  ...elements,
                  <DisplayRow
                    key={index}
                    line={line}
                    lineIndex={index}
                    columns={text.numberOfColumns}
                    labels={labels}
                    activeLine={activeLine}
                    matchLegacyLineIds={matchLegacyLineIds}
                    notes={text.notes}
                  >
                    {language && (
                      <TranslationColumn
                        lines={text.lines}
                        lineIndex={index}
                        language={language}
                      />
                    )}
                  </DisplayRow>,
                ]
            return [rows, getCurrentLabels(labels, line)]
          },
          [[], defaultLabels],
        )[0]
      }
    </>
  )
}

export default function TransliterationLines({
  text,
  activeLine = '',
  translationStyle = 'inline',
  language = null,
}: {
  text: Text
  activeLine?: string
  translationStyle?: TranslationStyle
  language?: string | null
}): JSX.Element {
  const DisplayTextComponent =
    translationStyle === 'standoff'
      ? DisplayTwoColumnText
      : DisplaySingleColumnText
  const matchLegacyLineIds = useMemo(
    () => !hasTextLineWithId(text.lines, activeLine),
    [text.lines, activeLine],
  )
  return (
    <table className="Transliteration__lines">
      <tbody>
        <FirstLineNotes notes={text.notes} columns={text.numberOfColumns} />
        <DisplayTextComponent
          text={text}
          activeLine={activeLine}
          matchLegacyLineIds={matchLegacyLineIds}
          language={language}
        />
      </tbody>
    </table>
  )
}

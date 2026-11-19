import React, { FunctionComponent, PropsWithChildren } from 'react'
import { Text, Notes } from 'transliteration/domain/text'
import { createLineId } from 'transliteration/ui/note-links'
import LineNotes from 'transliteration/ui/LineNotes'
import DisplayRulingDollarLine from 'transliteration/ui/rulings'
import DisplayTextLine from 'transliteration/ui/text-line'
import { DisplayDollarAndAtLine } from 'transliteration/ui/dollar-and-at-lines'
import { LineProps } from 'transliteration/ui/LineProps'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import {
  isColumnAtLine,
  isObjectAtLine,
  isSurfaceAtLine,
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
  language: string | null
  translationStyle: TranslationStyle
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
  hiddenLineNumbers,
}: {
  notes: Notes
  columns: number
  hiddenLineNumbers: readonly number[]
}): JSX.Element {
  return (
    <>
      {(!!notes.get(0)?.length || hiddenLineNumbers.length > 0) && (
        <tr id={createLineId(0)}>
          <td></td>
          <td colSpan={columns}></td>
          <td>
            <LineNotes
              notes={notes}
              lineNumber={0}
              hiddenLineNumbers={hiddenLineNumbers}
            />
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

function DisplayRow({
  line,
  lineIndex,
  columns,
  labels,
  activeLine,
  notes,
  hiddenLineNumbers,
  children,
}: PropsWithChildren<
  LineProps & {
    lineIndex: number
    notes: Notes
    hiddenLineNumbers: readonly number[]
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
      />
      <td>
        <LineNotes
          notes={notes}
          lineNumber={lineNumber}
          hiddenLineNumbers={hiddenLineNumbers}
        />
      </td>
      {children}
    </tr>
  )
}

function skipLine(
  line: AbstractLine,
  language: string | null,
  translationStyle: TranslationStyle,
): boolean {
  return (
    isTranslationLine(line) &&
    (translationStyle === 'standoff' ||
      (!!language && line.language !== language))
  )
}

function getHiddenNoteLines(
  lines: readonly AbstractLine[],
  notes: Notes,
  lineIndex: number,
  language: string | null,
  translationStyle: TranslationStyle,
): number[] {
  const lineNumbers: number[] = []
  for (
    let index = lineIndex + 1;
    index < lines.length && skipLine(lines[index], language, translationStyle);
    index++
  ) {
    if (notes.get(index + 1)?.length) lineNumbers.push(index + 1)
  }
  return lineNumbers
}

function DisplayText({
  text,
  activeLine,
  language,
  translationStyle,
}: TextDisplayProps): JSX.Element {
  const notes = text.notes
  const lines = text.lines
  return (
    <>
      {
        lines.reduce<[JSX.Element[], Labels]>(
          ([elements, labels], line, index) => {
            const rows = skipLine(line, language, translationStyle)
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
                    notes={notes}
                    hiddenLineNumbers={getHiddenNoteLines(
                      lines,
                      notes,
                      index,
                      language,
                      translationStyle,
                    )}
                  >
                    {translationStyle === 'standoff' && language && (
                      <TranslationColumn
                        lines={lines}
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
  const notes = text.notes
  const hiddenLineNumbers = getHiddenNoteLines(
    text.lines,
    notes,
    -1,
    language,
    translationStyle,
  )
  return (
    <table className="Transliteration__lines">
      <tbody>
        <FirstLineNotes
          notes={notes}
          columns={text.numberOfColumns}
          hiddenLineNumbers={hiddenLineNumbers}
        />
        <DisplayText
          text={text}
          activeLine={activeLine}
          language={language}
          translationStyle={translationStyle}
        />
      </tbody>
    </table>
  )
}

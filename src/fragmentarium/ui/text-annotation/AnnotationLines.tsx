import React, { useCallback } from 'react'
import { Notes } from 'transliteration/domain/text'
import { isIdToken } from 'transliteration/domain/type-guards'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { LineProps } from 'transliteration/ui/LineProps'
import { createLineId } from 'transliteration/ui/note-links'
import { defaultLineComponents } from 'transliteration/ui/TransliterationLines'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from 'transliteration/ui/line-number'
import { LineColumns } from 'transliteration/ui/line-tokens'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import Markable from 'fragmentarium/ui/text-annotation/Markable'

export type AnnotationLineProps = LineProps & {
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
  selectionStartTokenIdRef: React.MutableRefObject<string | null>
}

function DisplayAnnotationLine({
  line,
  columns,
  selection,
  setSelection,
  activeSpanId,
  setActiveSpanId,
  selectionStartTokenIdRef,
}: AnnotationLineProps): JSX.Element {
  const textLine = line as TextLine

  const TokenTrigger = useCallback(
    function TokenTrigger({
      children,
      token,
    }: TokenActionWrapperProps): JSX.Element {
      return isIdToken(token) ? (
        <Markable
          token={token}
          selection={selection}
          setSelection={setSelection}
          activeSpanId={activeSpanId}
          setActiveSpanId={setActiveSpanId}
          selectionStartTokenIdRef={selectionStartTokenIdRef}
        >
          {children}
        </Markable>
      ) : (
        <>{children}</>
      )
    },
    [
      selection,
      setSelection,
      activeSpanId,
      setActiveSpanId,
      selectionStartTokenIdRef,
    ],
  )

  return (
    <>
      <TransliterationTd
        type={textLine.type}
        className={'text-annotation__line-number'}
      >
        <LineNumber line={textLine} />
      </TransliterationTd>
      <LineColumns
        columns={textLine.columns}
        maxColumns={columns}
        TokenActionWrapper={TokenTrigger}
      />
    </>
  )
}

export default function DisplayRow({
  line,
  lineIndex,
  columns,
  labels,
  activeLine,
  selection,
  setSelection,
  activeSpanId,
  setActiveSpanId,
  selectionStartTokenIdRef,
}: AnnotationLineProps & {
  lineIndex: number
  notes: Notes
}): JSX.Element {
  const lineNumber = lineIndex + 1

  if (line.type === 'TextLine') {
    return (
      <>
        <tr id={createLineId(lineNumber)}>
          <DisplayAnnotationLine
            line={line}
            columns={columns}
            labels={labels}
            activeLine={activeLine}
            selection={selection}
            setSelection={setSelection}
            activeSpanId={activeSpanId}
            setActiveSpanId={setActiveSpanId}
            selectionStartTokenIdRef={selectionStartTokenIdRef}
          />
        </tr>
      </>
    )
  }
  const LineComponent =
    defaultLineComponents.get(line.type) || DisplayControlLine

  return (
    <tr id={createLineId(lineNumber)}>
      <LineComponent
        line={line}
        lineIndex={lineIndex}
        columns={columns}
        labels={labels}
        activeLine={activeLine}
      />
    </tr>
  )
}

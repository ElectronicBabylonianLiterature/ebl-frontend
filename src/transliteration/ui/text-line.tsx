import React, { useEffect, useRef } from 'react'
import { Anchor, LineNumber } from './line-number'
import { LineColumns } from './line-tokens'
import { TextLine } from 'transliteration/domain/text-line'
import { LineProps } from './LineProps'
import { lineNumberToAtf } from 'transliteration/domain/lineNumberToString'
import TransliterationTd from './TransliterationTd'
import { Labels, labelsAbbreviation } from 'transliteration/domain/labels'

export function createId(
  labels: Labels | undefined,
  textLine: TextLine
): string {
  const label = labels ? `${labelsAbbreviation(labels)} ` : ''
  return `${label}${lineNumberToAtf(textLine.lineNumber)}`
}

export default function DisplayTextLine({
  line,
  columns,
  labels,
  activeLine = '',
}: LineProps): JSX.Element {
  const textLine = line as TextLine
  const id = createId(labels, textLine)
  const lineRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (id === activeLine) {
      lineRef.current?.scrollIntoView()
    }
  }, [id, activeLine])

  return (
    <>
      <TransliterationTd type={textLine.type}>
        <Anchor className="Transliteration__anchor" id={id} ref={lineRef}>
          <LineNumber line={textLine} />
        </Anchor>
      </TransliterationTd>
      <LineColumns columns={textLine.columns} maxColumns={columns} />
    </>
  )
}

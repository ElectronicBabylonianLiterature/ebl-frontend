import React, { useEffect, useRef } from 'react'
import { Anchor, LineNumber } from './LineNumber'
import { LineColumns } from './line-tokens'
import { TextLine } from 'transliteration/domain/text-line'
import { LineProps } from './LineProps'
import { lineNumberToAtf } from 'transliteration/domain/lineNumberToString'
import TransliterationTd from './TransliterationTd'

function createId(surface: LineProps['surface'], textLine: TextLine) {
  const surfaceAbbreviation = surface ? `${surface.abbreviation} ` : ''
  const id = `${surfaceAbbreviation}${lineNumberToAtf(textLine.lineNumber)}`
  return id
}

export default function DisplayTextLine({
  line,
  columns,
  surface,
  activeLine = '',
}: LineProps): JSX.Element {
  const textLine = line as TextLine
  const id = createId(surface, textLine)
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

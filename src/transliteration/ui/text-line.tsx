import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'
import { LineNumber } from './LineNumber'
import { LineColumns } from './line-tokens'
import { TextLine } from 'transliteration/domain/text-line'
import { LineProps } from './LineProps'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

function createId(surface: LineProps['surface'], textLine: TextLine) {
  const surfaceAbbreviation = surface ? `${surface.abbreviation} ` : ''
  const id = `${surfaceAbbreviation}${lineNumberToString(textLine.lineNumber)}`
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
  const lineRef = useRef<HTMLTableCellElement>(null)

  useEffect(() => {
    if (id === activeLine) {
      lineRef.current?.scrollIntoView()
    }
  }, [id, activeLine])

  return (
    <>
      <td
        ref={lineRef}
        className={classNames([`Transliteration__${textLine.type}`])}
      >
        <LineNumber line={textLine} />
      </td>
      <LineColumns columns={textLine.columns} maxColumns={columns} />
    </>
  )
}

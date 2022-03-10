import React from 'react'
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
}: LineProps): JSX.Element {
  const textLine = line as TextLine
  const id = createId(surface, textLine)
  return (
    <>
      <td id={id} className={classNames([`Transliteration__${textLine.type}`])}>
        <LineNumber line={textLine} />
      </td>
      <LineColumns columns={textLine.columns} maxColumns={columns} />
    </>
  )
}

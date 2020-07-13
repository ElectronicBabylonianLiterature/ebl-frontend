import React from 'react'
import classNames from 'classnames'
import { LineNumber } from './LineNumber'
import { LineColumns } from './line-tokens'
import { TextLine } from 'transliteration/domain/text-line'
import { LineProps } from './LineProps'

export default function DisplayTextLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const textLine = line as TextLine
  return (
    <>
      <td className={classNames([`Transliteration__${textLine.type}`])}>
        <LineNumber line={textLine} />
      </td>
      <LineColumns columns={textLine.columns} maxColumns={columns} />
    </>
  )
}

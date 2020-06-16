import React from 'react'
import classNames from 'classnames'
import { LineNumber } from './LineNumber'
import { LineColumns } from './line-tokens'
import { Line, TextLine } from 'transliteration/domain/line'

export default function DisplayTextLine({ line }: { line: Line }): JSX.Element {
  const textLine = line as TextLine
  return (
    <>
      <td className={classNames([`Transliteration__${textLine.type}`])}>
        <LineNumber line={textLine} />
      </td>
      <LineColumns columns={textLine.columns} />
    </>
  )
}

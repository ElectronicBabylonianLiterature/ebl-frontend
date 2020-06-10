import React from 'react'
import classNames from 'classnames'
import { LineNumber } from './LineNumber'
import LineTokens from './LineTokens'
import { Line, TextLine } from 'transliteration/domain/line'

export default function DisplayTextLine({
  line,
  line: { type, content },
}: {
  line: Line
}): JSX.Element {
  return (
    <>
      <td className={classNames([`Transliteration__${type}`])}>
        <LineNumber line={line as TextLine} />
      </td>
      <td className={classNames([`Transliteration__${type}`])}>
        <LineTokens content={content} />
      </td>
    </>
  )
}

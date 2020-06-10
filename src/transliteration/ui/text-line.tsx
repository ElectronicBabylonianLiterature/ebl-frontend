import React from 'react'
import classNames from 'classnames'
import { LinePrefix } from './LinePrefix'
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
        <LinePrefix line={line as TextLine} />
      </td>
      <td className={classNames([`Transliteration__${type}`])}>
        <LineTokens content={content} />
      </td>
    </>
  )
}

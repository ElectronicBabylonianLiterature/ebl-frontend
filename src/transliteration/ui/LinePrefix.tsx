import { Line } from 'transliteration/domain/line'
import React from 'react'
import { isTextLine } from 'transliteration/domain/type-guards'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

export function LinePrefix({ line }: { line: Line }): JSX.Element {
  return isTextLine(line) ? (
    <sup>({lineNumberToString(line.lineNumber)})</sup>
  ) : (
    <span>{line.prefix}</span>
  )
}

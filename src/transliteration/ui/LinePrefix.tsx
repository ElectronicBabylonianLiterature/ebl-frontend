import { TextLine } from 'transliteration/domain/line'
import React from 'react'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

export function LinePrefix({ line }: { line: TextLine }): JSX.Element {
  return <sup>({lineNumberToString(line.lineNumber)})</sup>
}

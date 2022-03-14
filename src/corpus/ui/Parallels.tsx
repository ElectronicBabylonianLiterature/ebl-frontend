import React from 'react'
import { parallelLinePrefix } from 'transliteration/domain/parallel-line'
import { ControlLine } from 'transliteration/domain/line'

export default function Parallels({
  lines: parallelLines,
}: {
  lines: readonly ControlLine[]
}): JSX.Element {
  return (
    <ul className="chapter-display__parallels">
      {parallelLines.map((parallelLine) => (
        <li key="value">
          {parallelLinePrefix}
          {parallelLine.content.map(({ value }) => value).join('')}
        </li>
      ))}
    </ul>
  )
}

import React from 'react'
import {
  ParallelLine,
  parallelLinePrefix,
} from 'transliteration/domain/parallel-line'
import { DisplayParallel } from 'transliteration/ui/parallel-line'

export default function Parallels({
  lines: parallelLines,
}: {
  lines: readonly ParallelLine[]
}): JSX.Element {
  return (
    <ul className="chapter-display__parallels">
      {parallelLines.map((parallelLine, index) => (
        <li key={index}>
          {parallelLinePrefix}
          <DisplayParallel line={parallelLine} />
        </li>
      ))}
    </ul>
  )
}

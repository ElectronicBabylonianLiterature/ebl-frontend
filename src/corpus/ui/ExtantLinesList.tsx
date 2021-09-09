import React from 'react'
import _ from 'lodash'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  ExtantLine,
  ExtantLineRange,
  groupExtantLines,
  ManuscriptExtantLines,
} from 'corpus/domain/extant-lines'
import './ExtantLinesList.sass'
import classNames from 'classnames'

function LineNumber({ line }: { line: ExtantLine }): JSX.Element {
  return (
    <span
      className={classNames({
        'extant-lines__line-number': true,
        'extant-lines__line-number--boundary': line.isSideBoundary,
      })}
    >
      {lineNumberToString(line.lineNumber)}
    </span>
  )
}

function LineNumberRange({
  range: { start, end },
}: {
  range: ExtantLineRange
}): JSX.Element {
  return (
    <>
      <LineNumber line={start} />
      {end && (
        <>
          –
          <LineNumber line={end} />
        </>
      )}
    </>
  )
}

function LineNumberRanges({
  label,
  lines,
}: {
  label: string
  lines: readonly ExtantLine[]
}): JSX.Element {
  return (
    <>
      {label}{' '}
      {groupExtantLines(lines).map((range, index: number) => (
        <React.Fragment key={index}>
          {index > 0 && ', '}
          <LineNumberRange range={range} />
        </React.Fragment>
      ))}
    </>
  )
}
export default function ExtantLinesList({
  extantLines,
}: {
  extantLines: ManuscriptExtantLines
}): JSX.Element {
  return (
    <ol className="extant-lines">
      {_.map(extantLines, (lines, label) => (
        <li key={label}>
          <LineNumberRanges label={label} lines={lines} />
        </li>
      ))}
    </ol>
  )
}

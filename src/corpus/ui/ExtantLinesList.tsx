import React from 'react'
import _ from 'lodash'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  groupExtantLines,
  ManuscriptExtantLines,
} from 'corpus/domain/extant-lines'
import './ExtantLinesList.sass'

export default function ExtantLinesList({
  extantLines,
}: {
  extantLines: ManuscriptExtantLines
}): JSX.Element {
  return (
    <ol className="extant-lines">
      {_.map(extantLines, (lines, label) => (
        <li key={label}>
          {label}{' '}
          {groupExtantLines(lines).map(({ start, end }, index: number) => (
            <React.Fragment key={index}>
              {index > 0 && <>, </>}
              {start.isSideBoundary ? (
                <strong>{lineNumberToString(start.lineNumber)}</strong>
              ) : (
                lineNumberToString(start.lineNumber)
              )}
              {end && (
                <>
                  –
                  {end.isSideBoundary ? (
                    <strong>{lineNumberToString(end.lineNumber)}</strong>
                  ) : (
                    lineNumberToString(end.lineNumber)
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </li>
      ))}
    </ol>
  )
}

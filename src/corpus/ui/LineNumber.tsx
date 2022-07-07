import React, { useEffect, useRef } from 'react'
import lineNumberToString, {
  lineNumberToAtf,
} from 'transliteration/domain/lineNumberToString'
import { Anchor } from 'transliteration/ui/line-number'
import { OldLineNumber } from 'transliteration/domain/line-number'
import referencePopover from 'bibliography/ui/referencePopover'
import classnames from 'classnames'
import { LineDisplay } from 'corpus/domain/chapter'
import _ from 'lodash'

const OldLineNumberCitation = referencePopover(({ reference }) => (
  <sup>{reference.authors.join('/')}</sup>
))

function OldLineNumbers({
  oldLineNumbers = [],
  show,
}: {
  oldLineNumbers: readonly OldLineNumber[]
  show: boolean
}): JSX.Element {
  return (
    <span
      className={classnames({
        'chapter-display__old-line-numbers': true,
        hidden: !show,
      })}
    >
      &nbsp;(
      {oldLineNumbers.map((oldLineNumber, index) => (
        <React.Fragment key={index}>
          {index > 0 && '; '}
          {oldLineNumber.number}
          <OldLineNumberCitation reference={oldLineNumber.reference} />
        </React.Fragment>
      ))}
      )
    </span>
  )
}

export default function LineNumber({
  line,
  activeLine,
  showOldLineNumbers,
}: {
  line: LineDisplay
  activeLine: string
  showOldLineNumbers: boolean
}): JSX.Element {
  const ref = useRef<HTMLAnchorElement>(null)
  const id = lineNumberToAtf(line.number)

  useEffect(() => {
    if (id === activeLine) {
      ref.current?.scrollIntoView()
    }
  }, [id, activeLine])

  return (
    <td
      className={classnames({
        'chapter-display__line-number': true,
        'left-align': showOldLineNumbers,
      })}
    >
      <Anchor className="chapter-display__anchor" id={id} ref={ref}>
        {lineNumberToString(line.number)}
      </Anchor>
      {!_.isEmpty(line.oldLineNumbers) && (
        <OldLineNumbers
          oldLineNumbers={line.oldLineNumbers}
          show={showOldLineNumbers}
        />
      )}
    </td>
  )
}

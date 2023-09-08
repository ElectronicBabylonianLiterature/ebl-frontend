import React, { ReactNode, useEffect, useRef } from 'react'
import lineNumberToString, {
  lineNumberToAtf,
} from 'transliteration/domain/lineNumberToString'
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
          <span>{oldLineNumber.number}</span>
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
  url,
  children,
}: {
  line: LineDisplay
  activeLine: string
  showOldLineNumbers: boolean
  url?: string | null
  children?: ReactNode
}): JSX.Element {
  const ref = useRef<HTMLAnchorElement>(null)
  const id = lineNumberToAtf(line.number)
  const hash = `#${encodeURIComponent(id)}`

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
      {url ? (
        <a href={`${url}${hash}`} target="_blank" rel="noopener noreferrer">
          {lineNumberToString(line.number)}
        </a>
      ) : (
        <a
          className="chapter-display__anchor"
          id={id}
          ref={ref}
          href={hash}
          onClick={(event) => {
            event.preventDefault()
            window.history.replaceState(null, '', hash)
            ref.current?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          {lineNumberToString(line.number)}
        </a>
      )}
      {!_.isEmpty(line.oldLineNumbers) && (
        <OldLineNumbers
          oldLineNumbers={line.oldLineNumbers}
          show={showOldLineNumbers}
        />
      )}
      {children}
    </td>
  )
}

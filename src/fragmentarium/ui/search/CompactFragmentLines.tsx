import React from 'react'
import _ from 'lodash'
import { FragmentQueryPreviewLine } from 'query/QueryResult'
import 'fragmentarium/ui/search/CompactFragmentLines.sass'

type PreviewSegment = {
  text: string
  highlighted: boolean
}

function isHighlighted(
  uniqueLemma: readonly string[],
  lemmaIds: readonly string[],
): boolean {
  return !_.isEmpty(_.intersection(uniqueLemma, lemmaIds))
}

function createPreviewSegments(
  line: FragmentQueryPreviewLine,
  lemmaIds: readonly string[],
): readonly PreviewSegment[] {
  const segments: PreviewSegment[] = []
  let cursor = 0

  line.tokens.forEach((token) => {
    if (!token.value) {
      return
    }
    const tokenStart = line.text.indexOf(token.value, cursor)
    if (tokenStart < 0) {
      return
    }
    if (tokenStart > cursor) {
      segments.push({
        text: line.text.slice(cursor, tokenStart),
        highlighted: false,
      })
    }
    segments.push({
      text: line.text.slice(tokenStart, tokenStart + token.value.length),
      highlighted: isHighlighted(token.uniqueLemma, lemmaIds),
    })
    cursor = tokenStart + token.value.length
  })

  if (cursor < line.text.length) {
    segments.push({
      text: line.text.slice(cursor),
      highlighted: false,
    })
  }

  return segments.length > 0
    ? segments
    : [{ text: line.text, highlighted: false }]
}

function PreviewLineText({
  line,
  lemmaIds,
}: {
  line: FragmentQueryPreviewLine
  lemmaIds: readonly string[]
}): JSX.Element {
  return (
    <>
      {createPreviewSegments(line, lemmaIds).map((segment, index) => (
        <span
          className={
            segment.highlighted
              ? 'fragment-query-preview__token--highlight'
              : undefined
          }
          key={index}
        >
          {segment.text}
        </span>
      ))}
    </>
  )
}

export default function CompactFragmentLines({
  lines,
  lemmaIds = [],
  linesToShow,
  totalLines,
}: {
  lines: readonly FragmentQueryPreviewLine[]
  lemmaIds?: readonly string[]
  linesToShow: number
  totalLines: number
}): JSX.Element {
  const visibleLines = lines.slice(0, linesToShow)
  const remainingLines = Math.max(totalLines - visibleLines.length, 0)

  return (
    <table className="fragment-query-preview">
      <tbody>
        {visibleLines.map((line, index) => (
          <tr key={`${line.number}:${line.prefix}:${index}`}>
            <td className="fragment-lines-with-lemma__line-number">
              {line.prefix || line.number}
            </td>
            <td className="fragment-query-preview__line">
              <PreviewLineText line={line} lemmaIds={lemmaIds} />
            </td>
          </tr>
        ))}
        {remainingLines > 0 && (
          <tr>
            <td></td>
            <td>And {remainingLines} more</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

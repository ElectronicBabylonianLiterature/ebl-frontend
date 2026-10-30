import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { highlightLemmas, LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import lineNumberToString, {
  lineNumberToAtf,
} from 'transliteration/domain/lineNumberToString'
import { TextLine, TextLineLocation } from 'transliteration/domain/text-line'
import { LemmaPopover } from 'transliteration/ui/WordInfo'
import 'dictionary/ui/search/FragmentLemmaLines.sass'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'
import {
  defaultLabels,
  labelAbbreviation,
  Labels,
} from 'transliteration/domain/labels'
import { getCurrentLabels } from 'transliteration/ui/TransliterationLines'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

function locationFromLabels(labels: Labels): TextLineLocation | null {
  if (!labels.object && !labels.surface && !labels.column) {
    return null
  }
  return {
    object: labels.object ? labelAbbreviation(labels.object) : null,
    surface: labels.surface ? labelAbbreviation(labels.surface) : null,
    column: labels.column ? labelAbbreviation(labels.column) : null,
    sealNumber: null,
  }
}

function formatLineLocation(
  line: TextLine,
  location: TextLineLocation | null,
): string {
  const number = lineNumberToString(line.lineNumber)
  if (!location) {
    return number
  }
  const object =
    typeof location.object === 'string' ? location.object.trim() : ''
  const surface =
    typeof location.surface === 'string' ? location.surface.trim() : ''
  const column =
    typeof location.column === 'string' ? location.column.trim() : ''
  const surfaceLabel =
    surface && !surface.endsWith('.') ? `${surface}.` : surface
  return [object, surfaceLabel, column, number].filter(Boolean).join(' ')
}

function lineHash(
  line: TextLine,
  location: TextLineLocation | null,
): string | null {
  if (!location) {
    return null
  }
  const labels = [location.object, location.surface, location.column].filter(
    (label): label is string => typeof label === 'string' && !!label.trim(),
  )
  return labels.length
    ? `${labels.join(' ')} ${lineNumberToAtf(line.lineNumber)}`
    : null
}

export default function RenderFragmentLines({
  fragment,
  lemmaIds,
  linesToShow,
  totalMatchingLines,
  totalLines,
  matchingLineIndexes,
}: {
  fragment: Fragment
  lemmaIds?: readonly string[]
  linesToShow: number
  totalMatchingLines?: number | null
  totalLines?: number | null
  matchingLineIndexes?: readonly number[]
}): JSX.Element {
  let labels = defaultLabels
  const matchingLines: { line: TextLine; location: TextLineLocation | null }[] =
    []
  for (const line of fragment.text.lines) {
    if (line.type === 'TextLine') {
      const textLine = line as TextLine
      matchingLines.push({
        line: textLine,
        location: textLine.location ?? locationFromLabels(labels),
      })
    }
    labels = getCurrentLabels(labels, line)
  }
  const visibleLines = matchingLines.slice(0, linesToShow)
  const knownTotal = totalMatchingLines ?? totalLines
  const remainingLines =
    typeof knownTotal === 'number' &&
    Number.isSafeInteger(knownTotal) &&
    knownTotal >= 0
      ? Math.max(knownTotal - visibleLines.length, 0)
      : null
  const mayHaveMoreLines =
    remainingLines === null &&
    (matchingLines.length > visibleLines.length ||
      takeUniqueMatchingLineIndexes(
        matchingLineIndexes ?? [],
        visibleLines.length + 1,
      ).length > visibleLines.length)
  const lineNoun = totalLines === undefined ? 'matching line' : 'line'

  return (
    <table>
      <tbody>
        {visibleLines.map(({ line, location }, index) => {
          const label = formatLineLocation(line, location)
          const hash = lineHash(line, location)
          const columns = [
            {
              span: 1,
              content: createColumns(line.content).flatMap(
                (column) => column.content,
              ),
            },
          ]

          return (
            <tr key={index}>
              <td className={'fragment-lines-with-lemma__line-number'}>
                {hash ? (
                  <FragmentLink number={fragment.number} hash={hash}>
                    {label}
                  </FragmentLink>
                ) : (
                  label
                )}
              </td>
              <LineColumns
                columns={columns}
                maxColumns={1}
                TokenActionWrapper={LemmaPopover}
                conditionalBemModifiers={highlightLemmas(lemmaIds || [])}
              />
            </tr>
          )
        })}
        {((remainingLines !== null && remainingLines > 0) ||
          mayHaveMoreLines) && (
          <tr>
            <td></td>
            <td>
              {remainingLines === null
                ? `More ${lineNoun}s may be available`
                : `And ${remainingLines} more ${lineNoun}${remainingLines === 1 ? '' : 's'}`}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { highlightLemmas, LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLine } from 'transliteration/domain/text-line'
import { LemmaPopover } from 'transliteration/ui/WordInfo'
import 'dictionary/ui/search/FragmentLemmaLines.sass'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

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
  const matchingLines = fragment.text.lines.filter(
    (line) => line.type === 'TextLine',
  ) as TextLine[]
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
        {visibleLines.map((line, index) => {
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
                {lineNumberToString(line.lineNumber)}
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

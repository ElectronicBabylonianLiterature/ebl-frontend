import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { highlightLemmas, LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLine } from 'transliteration/domain/text-line'
import { LemmaPopover } from 'transliteration/ui/WordInfo'
import 'dictionary/ui/search/FragmentLemmaLines.sass'

export default function RenderFragmentLines({
  fragment,
  lemmaIds,
  linesToShow,
  totalLines,
}: {
  fragment: Fragment
  lemmaIds?: readonly string[]
  linesToShow: number
  totalLines?: number
}): JSX.Element {
  const matchingLines = fragment.text.lines.filter(
    (line) => line.type === 'TextLine',
  ) as TextLine[]
  const visibleLines = matchingLines.slice(0, linesToShow)
  const authoritativeTotal = totalLines ?? matchingLines.length
  const remainingLines = Math.max(authoritativeTotal - visibleLines.length, 0)

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

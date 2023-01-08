import React from 'react'
import withData from 'http/withData'
import { QueryResult } from 'query/QueryResult'
import { QueryService } from 'query/QueryService'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLine } from 'transliteration/domain/text-line'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import './FragmentLemmaLines.sass'
import _ from 'lodash'

const linesToShow = 3

export function RenderFragmentLines({
  fragment,
  lemmaIds,
  linesToShow,
  totalLines,
}: {
  fragment: Fragment
  lemmaIds?: readonly string[]
  linesToShow: number
  totalLines: number
}): JSX.Element {
  const lines = fragment.text.lines.map((line) => line as TextLine)

  return (
    <>
      {lines.map((line, index) => {
        const columns = [
          {
            span: 1,
            content: createColumns(line.content).flatMap(
              (column) => column.content
            ),
          },
        ]
        return (
          <tr key={index}>
            {index === 0 && (
              <th
                rowSpan={lines.length}
                className={'fragment-lines-with-lemma__fragment-number'}
              >
                <FragmentLink number={fragment.number}>
                  {fragment.number}
                </FragmentLink>
              </th>
            )}
            <td className={'fragment-lines-with-lemma__line-number'}>
              {lineNumberToString(line.lineNumber)}
            </td>
            <LineColumns
              columns={columns}
              maxColumns={1}
              highlightLemmas={lemmaIds || []}
            />
          </tr>
        )
      })}
      {totalLines > linesToShow && (
        <tr>
          <td></td>
          <td></td>
          <td>And {totalLines - linesToShow} more</td>
        </tr>
      )}
    </>
  )
}

const FragmentLines = withData<
  { lemmaId: string; lineIndexes: readonly number[] },
  {
    museumNumber: string
    fragmentService: FragmentService
  },
  Fragment
>(
  ({ data: fragment, lemmaId, lineIndexes }): JSX.Element => (
    <RenderFragmentLines
      fragment={fragment}
      linesToShow={linesToShow}
      totalLines={lineIndexes.length}
      lemmaIds={[lemmaId]}
    />
  ),
  (props) =>
    props.fragmentService.find(
      props.museumNumber,
      _.take(props.lineIndexes, linesToShow)
    )
)

export function FragmentLemmaLines({
  queryResult,
  fragmentService,
  lemmaId,
}: {
  queryResult: QueryResult
  fragmentService: FragmentService
  lemmaId: string
}): JSX.Element {
  return (
    <table>
      <tbody>
        {_.take(queryResult.items, 10).map((queryItem, index) => {
          return (
            <FragmentLines
              lineIndexes={queryItem.matchingLines}
              museumNumber={museumNumberToString(queryItem.museumNumber)}
              fragmentService={fragmentService}
              lemmaId={lemmaId}
              key={index}
            />
          )
        })}
      </tbody>
    </table>
  )
}

export default withData<
  {
    lemmaId: string
    fragmentService: FragmentService
  },
  { queryService: QueryService },
  QueryResult
>(
  ({ data: queryResult, fragmentService, lemmaId }): JSX.Element => {
    return (
      <>
        <p>{queryResult.matchCountTotal.toLocaleString()} attestations</p>
        <FragmentLemmaLines
          queryResult={queryResult}
          fragmentService={fragmentService}
          lemmaId={lemmaId}
        />
      </>
    )
  },
  (props) => props.queryService.query({ lemmas: props.lemmaId })
)

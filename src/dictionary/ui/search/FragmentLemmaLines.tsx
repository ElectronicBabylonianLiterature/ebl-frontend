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

const limitPerFragment = 3

const FragmentLines = withData<
  { lemmaId: string; lineIndexes: readonly number[] },
  {
    museumNumber: string
    lineIndexes: readonly number[]
    fragmentService: FragmentService
  },
  Fragment
>(
  ({ data: fragment, lemmaId, lineIndexes }): JSX.Element => {
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
                highlightLemma={lemmaId}
              />
            </tr>
          )
        })}
        {lineIndexes.length > limitPerFragment && (
          <tr>
            <td></td>
            <td></td>
            <td>And {lineIndexes.length - limitPerFragment} more</td>
          </tr>
        )}
      </>
    )
  },
  (props) =>
    props.fragmentService.find(
      props.museumNumber,
      props.lineIndexes.slice(0, limitPerFragment)
    )
)

function FragmentLemmaLines({
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
        {queryResult.items.slice(0, 10).map((queryItem, index) => {
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
  { lemmaId: string; fragmentService: FragmentService },
  { lemmaId: string; queryService: QueryService },
  QueryResult
>(
  ({ data: queryResult, fragmentService, lemmaId }): JSX.Element => {
    return (
      <>
        <p>{queryResult.matchCountTotal} attestations</p>
        <FragmentLemmaLines
          queryResult={queryResult}
          fragmentService={fragmentService}
          lemmaId={lemmaId}
        />
      </>
    )
  },
  (props) => props.queryService.query(props.lemmaId)
)

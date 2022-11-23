import React from 'react'
import withData from 'http/withData'
import { QueryResult } from 'query/QueryResult'
import { QueryService } from 'query/QueryService'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLine } from 'transliteration/domain/text-line'

const FragmentLine = withData<
  { lemmaId: string },
  {
    number: string
    lineIndex: number
    fragmentService: FragmentService
  },
  Fragment
>(
  ({ data: fragment, lemmaId }): JSX.Element => {
    const line = fragment.text.lines[0] as TextLine
    const columns = [
      {
        span: 1,
        content: createColumns(line.content).flatMap(
          (column) => column.content
        ),
      },
    ]

    return (
      <>
        <td>{lineNumberToString(line.lineNumber)}</td>
        <LineColumns
          columns={columns}
          maxColumns={1}
          highlightLemma={lemmaId}
        />
      </>
    )
  },
  (props) => props.fragmentService.find(props.number, [props.lineIndex])
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
          const museumNumber = museumNumberToString(queryItem.museumNumber)
          return (
            <tr key={index}>
              <td>
                <FragmentLink number={museumNumber}>
                  {museumNumber}
                </FragmentLink>
              </td>
              <FragmentLine
                number={museumNumber}
                lineIndex={queryItem.matchingLines[0]}
                fragmentService={fragmentService}
                lemmaId={lemmaId}
              />
            </tr>
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

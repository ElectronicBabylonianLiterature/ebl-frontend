import React from 'react'
import withData from 'http/withData'
import { QueryResult } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import './FragmentLemmaLines.sass'
import _ from 'lodash'
import { TextLine } from 'transliteration/domain/text-line'
import { Col, Row } from 'react-bootstrap'

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
  const lines = fragment.text.lines.filter(
    (line) => line.type === 'TextLine'
  ) as TextLine[]

  return (
    <table>
      <tbody>
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
            <td>And {totalLines - linesToShow} more</td>
          </tr>
        )}
      </tbody>
    </table>
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
    <>
      {_.take(queryResult.items, 10).map((queryItem, index) => {
        const number = museumNumberToString(queryItem.museumNumber)
        return (
          <Row key={index}>
            <Col xs={1}>
              <FragmentLink number={number}>{number}</FragmentLink>
            </Col>
            <Col className={'fragmentlines-column'}>
              <FragmentLines
                lineIndexes={queryItem.matchingLines}
                museumNumber={museumNumberToString(queryItem.museumNumber)}
                fragmentService={fragmentService}
                lemmaId={lemmaId}
                key={index}
              />
            </Col>
          </Row>
        )
      })}
    </>
  )
}

export default withData<
  {
    lemmaId: string
    fragmentService: FragmentService
  },
  unknown,
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
  ({ fragmentService, lemmaId }) => fragmentService.query({ lemmas: lemmaId })
)

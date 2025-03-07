import React, { PropsWithChildren } from 'react'
import withData from 'http/withData'
import { QueryResult } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import './FragmentLemmaLines.sass'
import _ from 'lodash'
import { TextLine } from 'transliteration/domain/text-line'
import { Col, Row } from 'react-bootstrap'
import LemmaQueryLink from '../display/LemmaQueryLink'
import WordInfoWithPopover from 'transliteration/ui/WordInfo'
import { isAnyWord } from 'transliteration/domain/type-guards'
import { Token } from 'transliteration/domain/token'

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

  const WordInfoPopover = ({
    token,
    children,
  }: PropsWithChildren<{
    token: Token
  }>): JSX.Element => {
    return isAnyWord(token) ? (
      <WordInfoWithPopover word={token}>{children}</WordInfoWithPopover>
    ) : (
      <>{children}</>
    )
  }

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
                TokenActionWrapper={WordInfoPopover}
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
        return (
          <Row key={index}>
            <Col xs={1}>
              <FragmentLink number={queryItem.museumNumber}>
                {queryItem.museumNumber}
              </FragmentLink>
            </Col>
            <Col className={'fragmentlines-column'}>
              <FragmentLines
                lineIndexes={queryItem.matchingLines}
                museumNumber={queryItem.museumNumber}
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
    const total = queryResult.matchCountTotal.toLocaleString()
    const hasMatches = queryResult.matchCountTotal > 0

    return (
      <>
        <p>
          {total} matches&nbsp;
          {hasMatches && <LemmaQueryLink lemmaId={lemmaId} />}
        </p>
        <FragmentLemmaLines
          queryResult={queryResult}
          fragmentService={fragmentService}
          lemmaId={lemmaId}
        />
        {hasMatches && (
          <LemmaQueryLink lemmaId={lemmaId}>
            Show all {total} matches in Library search&nbsp;
          </LemmaQueryLink>
        )}
      </>
    )
  },
  ({ fragmentService, lemmaId }) => fragmentService.query({ lemmas: lemmaId })
)

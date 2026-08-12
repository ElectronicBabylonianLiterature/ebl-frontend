import React from 'react'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { highlightLemmas, LineColumns } from 'transliteration/ui/line-tokens'
import { createColumns } from 'transliteration/domain/columns'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import './FragmentLemmaLines.sass'
import _ from 'lodash'
import { TextLine } from 'transliteration/domain/text-line'
import { Col, Row } from 'react-bootstrap'
import LemmaQueryLink from '../display/LemmaQueryLink'
import { LemmaPopover } from 'transliteration/ui/WordInfo'
import { hasRenderReadyFragment } from 'query/queryItemRenderReady'
import CompactFragmentLines from 'fragmentarium/ui/search/CompactFragmentLines'

export const FRAGMENT_LINES_TO_SHOW = 3
export const FRAGMENT_EXAMPLE_LIMIT = 10

export function RenderFragmentLines({
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
      linesToShow={FRAGMENT_LINES_TO_SHOW}
      totalLines={lineIndexes.length}
      lemmaIds={[lemmaId]}
    />
  ),
  (props) =>
    props.fragmentService.find(
      props.museumNumber,
      _.take(props.lineIndexes, FRAGMENT_LINES_TO_SHOW),
    ),
  {
    watch: ({ museumNumber, lineIndexes }) => [
      museumNumber,
      lineIndexes.join(','),
    ],
  },
)

function QueryItemFragmentLines({
  queryItem,
  fragmentService,
  lemmaId,
}: {
  queryItem: QueryItem
  fragmentService: FragmentService
  lemmaId: string
}): JSX.Element {
  return queryItem.cardSummary ? (
    <CompactFragmentLines
      lines={queryItem.cardSummary.matchingLinePreview}
      linesToShow={FRAGMENT_LINES_TO_SHOW}
      totalLines={queryItem.matchCount}
      lemmaIds={[lemmaId]}
    />
  ) : hasRenderReadyFragment(queryItem) ? (
    <RenderFragmentLines
      fragment={queryItem.fragment}
      linesToShow={FRAGMENT_LINES_TO_SHOW}
      totalLines={queryItem.matchCount}
      lemmaIds={[lemmaId]}
    />
  ) : (
    <FragmentLines
      lineIndexes={queryItem.matchingLines}
      museumNumber={queryItem.museumNumber}
      fragmentService={fragmentService}
      lemmaId={lemmaId}
    />
  )
}

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
      {_.take(queryResult.items, FRAGMENT_EXAMPLE_LIMIT).map(
        (queryItem, index) => {
          return (
            <Row key={index}>
              <Col xs={1}>
                <FragmentLink number={queryItem.museumNumber}>
                  {queryItem.museumNumber}
                </FragmentLink>
              </Col>
              <Col className={'fragmentlines-column'}>
                <QueryItemFragmentLines
                  queryItem={queryItem}
                  fragmentService={fragmentService}
                  lemmaId={lemmaId}
                />
              </Col>
            </Row>
          )
        },
      )}
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
    // Keep the item-count fallback for backends that ignore count: 'exact'.
    const hasMatchCount = typeof queryResult.matchCountTotal === 'number'
    const total = hasMatchCount
      ? queryResult.matchCountTotal.toLocaleString()
      : null
    const hasMatches = hasMatchCount
      ? queryResult.matchCountTotal > 0
      : queryResult.items.length > 0

    return (
      <>
        <p>
          {hasMatchCount ? (
            <>
              {queryResult.isMatchCountTotalExact === false && 'About '}
              {total} matches&nbsp;
            </>
          ) : (
            <>
              Showing{' '}
              {Math.min(
                queryResult.items.length,
                FRAGMENT_EXAMPLE_LIMIT,
              ).toLocaleString()}{' '}
              Library document example
              {Math.min(queryResult.items.length, FRAGMENT_EXAMPLE_LIMIT) === 1
                ? ''
                : 's'}
              &nbsp;
            </>
          )}
          {hasMatches && <LemmaQueryLink lemmaId={lemmaId} />}
        </p>
        <FragmentLemmaLines
          queryResult={queryResult}
          fragmentService={fragmentService}
          lemmaId={lemmaId}
        />
        {hasMatches && (
          <LemmaQueryLink lemmaId={lemmaId}>
            {hasMatchCount && queryResult.isMatchCountTotalExact !== false ? (
              <>Show all {total} matches in Library search&nbsp;</>
            ) : (
              <>Show matches in Library search&nbsp;</>
            )}
          </LemmaQueryLink>
        )}
      </>
    )
  },
  ({ fragmentService, lemmaId }) =>
    fragmentService.query({
      lemmas: lemmaId,
      limit: FRAGMENT_EXAMPLE_LIMIT,
      count: 'exact',
    }),
)

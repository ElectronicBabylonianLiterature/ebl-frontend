import React from 'react'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import './FragmentLemmaLines.sass'
import _ from 'lodash'
import { Col, Row } from 'react-bootstrap'
import LemmaQueryLink from '../display/LemmaQueryLink'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import {
  hasRenderReadyFragment,
  hasUnsupportedFragmentCardSummary,
} from 'query/queryItemRenderReady'
import { UnavailableSummaryNote } from 'fragmentarium/ui/search/UnavailableFragmentCard'

export const FRAGMENT_LINES_TO_SHOW = 3
export const FRAGMENT_EXAMPLE_LIMIT = 10

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
  if (hasRenderReadyFragment(queryItem)) {
    return (
      <RenderFragmentLines
        fragment={queryItem.fragment}
        linesToShow={FRAGMENT_LINES_TO_SHOW}
        totalLines={queryItem.matchCount}
        lemmaIds={[lemmaId]}
      />
    )
  }

  if (hasUnsupportedFragmentCardSummary(queryItem)) {
    return <UnavailableSummaryNote />
  }

  return (
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

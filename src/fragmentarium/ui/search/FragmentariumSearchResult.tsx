import React from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import { FragmentQuery } from 'query/FragmentQuery'
import { linesToShow } from './FragmentariumSearch'
import './FragmentariumSearchResult.sass'
import { stringify } from 'query-string'
import { FragmentLines } from './FragmentariumSearchResultComponents'
import DossiersService from 'dossiers/application/DossiersService'
import PaginationItems from './PaginationItems'
import { paginationURLParam, RESULTS_PER_PAGE } from './pagination'

function getPageIndex(fragmentQuery: FragmentQuery): number {
  const offset = fragmentQuery.offset ?? 0
  return Number.isInteger(offset) && offset >= 0
    ? Math.floor(offset / RESULTS_PER_PAGE)
    : 0
}

function ResultPages({
  fragments,
  fragmentService,
  dossiersService,
  linesToShow,
  queryLemmas,
  pageIndex,
  hasNextPage,
}: {
  fragments: readonly QueryItem[]
  fragmentService: FragmentService
  dossiersService: DossiersService
  linesToShow: number
  queryLemmas?: readonly string[]
  pageIndex: number
  hasNextPage: boolean
}): JSX.Element {
  const pageButtons = (
    <Row>
      <Col className="d-flex justify-content-center">
        <PaginationItems
          activePage={pageIndex}
          hasNextPage={hasNextPage}
          paginationURLParam={paginationURLParam}
        />
      </Col>
    </Row>
  )

  return (
    <>
      {pageButtons}
      {fragments.map((fragment) => (
        <React.Fragment
          key={`${fragment.museumNumber}:${fragment.matchingLines.join(',')}`}
        >
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={fragment}
            active={pageIndex}
            queryLemmas={queryLemmas}
            linesToShow={linesToShow}
          />
        </React.Fragment>
      ))}

      {pageButtons}
    </>
  )
}

export const SearchResult = withData<
  {
    fragmentService: FragmentService
    dossiersService: DossiersService
    fragmentQuery: FragmentQuery
  },
  unknown,
  QueryResult
>(
  ({ data, fragmentService, dossiersService, fragmentQuery }): JSX.Element => {
    const fragmentCount = data.items.length
    const pageIndex = getPageIndex(fragmentQuery)
    const offset = fragmentQuery.offset ?? pageIndex * RESULTS_PER_PAGE
    const isLineQuery = fragmentQuery.lemmas || fragmentQuery.transliteration
    const hasLineCount = typeof data.matchCountTotal === 'number'
    const documentCountInfo = `${fragmentCount.toLocaleString()} document${
      fragmentCount === 1 ? '' : 's'
    }`
    const lineResultInfo = hasLineCount
      ? `Found ${data.isMatchCountTotalExact === false ? 'about ' : ''}${data.matchCountTotal.toLocaleString()} line${
          data.matchCountTotal === 1 ? '' : 's'
        } in ${documentCountInfo}`
      : `Found ${documentCountInfo}`
    const pageResultInfo =
      fragmentCount > 0
        ? `Showing results ${(offset + 1).toLocaleString()}-${(
            offset + fragmentCount
          ).toLocaleString()}`
        : pageIndex > 0
          ? 'No results on this page'
          : `Found ${documentCountInfo}`
    const resultInfo = isLineQuery ? lineResultInfo : pageResultInfo
    const showNumberSuggestion =
      fragmentCount === 0 && fragmentQuery.number?.match(/^[^.]+\s+[^.]+$/)
    const fixedNumber = fragmentQuery.number?.split(/\s+/).join('.')
    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            {resultInfo}
            {data.hasNextPage === true && '; more results are available'}
            {showNumberSuggestion && (
              <>
                {'. Did you mean'}
                &nbsp;
                <a
                  href={`/library/search?${stringify(
                    _.omit(
                      {
                        ...fragmentQuery,
                        number: fixedNumber,
                      },
                      ['limit', 'offset', 'count'],
                    ),
                  )}`}
                >
                  {fixedNumber}
                </a>
                ?
              </>
            )}
          </Col>
        </Row>

        {(fragmentCount > 0 || pageIndex > 0 || data.hasNextPage === true) && (
          <ResultPages
            fragments={data.items}
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryLemmas={fragmentQuery.lemmas?.split('+')}
            pageIndex={pageIndex}
            hasNextPage={data.hasNextPage === true}
            linesToShow={Math.max(
              _.trimEnd(fragmentQuery.transliteration || '').split('\n').length,
              linesToShow,
            )}
          />
        )}
      </>
    )
  },
  ({ fragmentService, fragmentQuery }) => fragmentService.query(fragmentQuery),
  {
    watch: ({ fragmentQuery }) => [stringify(fragmentQuery)],
  },
)

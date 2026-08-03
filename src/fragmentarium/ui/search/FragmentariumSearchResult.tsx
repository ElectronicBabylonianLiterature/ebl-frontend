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
import {
  getPageIndexForOffset,
  getValidatedPageSize,
  paginationURLParam,
} from './pagination'

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
    resultPageSize?: number
  },
  unknown,
  QueryResult
>(
  ({
    data,
    fragmentService,
    dossiersService,
    fragmentQuery,
    resultPageSize,
  }): JSX.Element => {
    const isLineQuery = Boolean(
      fragmentQuery.lemmas || fragmentQuery.transliteration,
    )
    const visiblePageSize =
      resultPageSize ?? getValidatedPageSize(fragmentQuery.limit)
    const visibleItems = isLineQuery
      ? data.items.slice(0, visiblePageSize)
      : data.items
    const effectiveHasNextPage =
      data.hasNextPage ?? (isLineQuery && data.items.length > visiblePageSize)
    const fragmentCount = visibleItems.length
    const pageIndex = getPageIndexForOffset(
      fragmentQuery.offset,
      visiblePageSize,
    )
    const offset = pageIndex * visiblePageSize
    const hasLineCount = typeof data.matchCountTotal === 'number'
    const isCompleteFirstPage = pageIndex === 0 && effectiveHasNextPage !== true
    const pageDocumentCount = `${fragmentCount.toLocaleString()} document${
      fragmentCount === 1 ? '' : 's'
    }`
    const documentRange =
      fragmentCount > 0
        ? `Showing documents ${(offset + 1).toLocaleString()}-${(
            offset + fragmentCount
          ).toLocaleString()}`
        : pageIndex > 0
          ? 'No results on this page'
          : 'Found 0 documents'
    const lineCountInfo = hasLineCount
      ? `Found ${data.isMatchCountTotalExact === false ? 'about ' : ''}${data.matchCountTotal.toLocaleString()} matching line${
          data.matchCountTotal === 1 ? '' : 's'
        }`
      : null
    const lineResultInfo = lineCountInfo
      ? `${lineCountInfo}. ${documentRange}`
      : isCompleteFirstPage
        ? `Found ${pageDocumentCount}`
        : documentRange
    const resultInfo = isLineQuery ? lineResultInfo : documentRange
    const showNumberSuggestion =
      fragmentCount === 0 && fragmentQuery.number?.match(/^[^.]+\s+[^.]+$/)
    const fixedNumber = fragmentQuery.number?.split(/\s+/).join('.')
    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            {resultInfo}
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

        {(fragmentCount > 0 ||
          pageIndex > 0 ||
          effectiveHasNextPage === true) && (
          <ResultPages
            fragments={visibleItems}
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryLemmas={fragmentQuery.lemmas?.split('+')}
            pageIndex={pageIndex}
            hasNextPage={effectiveHasNextPage === true}
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

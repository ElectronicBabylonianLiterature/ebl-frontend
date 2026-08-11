import React from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import { FragmentSearchCriteria } from 'query/FragmentQuery'
import { linesToShow } from './FragmentariumSearch'
import './FragmentariumSearchResult.sass'
import { stringify } from 'query-string'
import { FragmentLines } from './FragmentariumSearchResultComponents'
import DossiersService from 'dossiers/application/DossiersService'
import PaginationItems from './PaginationItems'
import {
  createPagedFragmentQuery,
  isLineQuery,
  paginationURLParam,
  SearchPagination,
} from './pagination'

function ResultPages({
  fragments,
  fragmentService,
  dossiersService,
  linesToShow,
  queryLemmas,
  pageIndex,
  pageSize,
  hasNextPage,
}: {
  fragments: readonly QueryItem[]
  fragmentService: FragmentService
  dossiersService: DossiersService
  linesToShow: number
  queryLemmas?: readonly string[]
  pageIndex: number
  pageSize: number
  hasNextPage: boolean
}): JSX.Element {
  const pageButtons = (
    <Row>
      <Col className="d-flex justify-content-center">
        <PaginationItems
          activePage={pageIndex}
          pageSize={pageSize}
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
    fragmentQuery: FragmentSearchCriteria
    pagination: SearchPagination
  },
  unknown,
  QueryResult
>(
  ({
    data,
    fragmentService,
    dossiersService,
    fragmentQuery,
    pagination: { pageIndex, pageSize },
  }): JSX.Element => {
    const visibleItems = data.items.slice(0, pageSize)
    const effectiveHasNextPage = isLineQuery(fragmentQuery)
      ? data.items.length > pageSize
      : (data.hasNextPage ?? data.items.length > pageSize)
    const fragmentCount = visibleItems.length
    const offset = pageIndex * pageSize
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
    const lineCountInfo =
      isLineQuery(fragmentQuery) && hasLineCount
        ? `Found ${data.isMatchCountTotalExact === false ? 'about ' : ''}${data.matchCountTotal.toLocaleString()} matching line${
            data.matchCountTotal === 1 ? '' : 's'
          }`
        : null
    const resultInfo = lineCountInfo
      ? `${lineCountInfo}. ${documentRange}`
      : isCompleteFirstPage
        ? `Found ${pageDocumentCount}`
        : documentRange
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
                  href={`/library/search?${stringify({
                    ...fragmentQuery,
                    number: fixedNumber,
                  })}`}
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
            pageSize={pageSize}
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
  ({ fragmentService, fragmentQuery, pagination }) =>
    fragmentService.query(createPagedFragmentQuery(fragmentQuery, pagination)),
  {
    watch: ({ fragmentQuery, pagination }) => [
      stringify(createPagedFragmentQuery(fragmentQuery, pagination)),
    ],
  },
)

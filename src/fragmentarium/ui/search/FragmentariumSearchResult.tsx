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
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import { FragmentLines } from './FragmentariumSearchResultComponents'
import DossiersService from 'dossiers/application/DossiersService'
import PaginationItems from './PaginationItems'
import {
  getPageIndexForOffset,
  getValidatedPageSize,
  paginationURLParam,
  updatePaginationSearchParam,
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
  },
  unknown,
  QueryResult
>(
  ({ data, fragmentService, dossiersService, fragmentQuery }): JSX.Element => {
    const location = useLocation()
    const history = useHistory()
    const fragmentCount = data.items.length
    const pageIndex = getPageIndexForOffset(
      fragmentQuery.offset,
      fragmentQuery.limit,
    )
    const offset = pageIndex * getValidatedPageSize(fragmentQuery.limit)
    const isLineQuery = Boolean(
      fragmentQuery.lemmas || fragmentQuery.transliteration,
    )
    const hasLineCount = typeof data.matchCountTotal === 'number'
    const documentCountInfo = `${fragmentCount.toLocaleString()} document${
      fragmentCount === 1 ? '' : 's'
    }`
    const isCompleteFirstPage = pageIndex === 0 && data.hasNextPage !== true
    const pageRange =
      fragmentCount > 0
        ? isCompleteFirstPage
          ? `Found ${documentCountInfo}`
          : `Showing documents ${(offset + 1).toLocaleString()}-${(
              offset + fragmentCount
            ).toLocaleString()}`
        : pageIndex > 0
          ? 'No results on this page'
          : 'Found 0 documents'
    const lineResultInfo = hasLineCount
      ? isCompleteFirstPage
        ? `Found ${data.isMatchCountTotalExact === false ? 'about ' : ''}${data.matchCountTotal.toLocaleString()} line${
            data.matchCountTotal === 1 ? '' : 's'
          } in ${documentCountInfo}`
        : `Found ${data.isMatchCountTotalExact === false ? 'about ' : ''}${data.matchCountTotal.toLocaleString()} matching line${
            data.matchCountTotal === 1 ? '' : 's'
          }${fragmentCount > 0 ? `. ${pageRange}` : ''}`
      : pageRange
    const resultInfo = isLineQuery ? lineResultInfo : pageRange
    const showNumberSuggestion =
      fragmentCount === 0 && fragmentQuery.number?.match(/^[^.]+\s+[^.]+$/)
    const fixedNumber = fragmentQuery.number?.split(/\s+/).join('.')
    React.useEffect(() => {
      if (
        data.items.length === 0 &&
        pageIndex > 0 &&
        data.hasNextPage !== true
      ) {
        history.replace({
          search: updatePaginationSearchParam(
            location.search,
            paginationURLParam,
            0,
          ),
        })
      }
    }, [
      data.hasNextPage,
      data.items.length,
      history,
      location.search,
      pageIndex,
    ])
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

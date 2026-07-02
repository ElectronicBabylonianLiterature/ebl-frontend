import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import { FragmentQuery } from 'query/FragmentQuery'
import { linesToShow } from './FragmentariumSearch'
import './FragmentariumSearchResult.sass'
import { parse, stringify } from 'query-string'
import { FragmentLines } from './FragmentariumSearchResultComponents'
import DossiersService from 'dossiers/application/DossiersService'
import PaginationItems from './PaginationItems'
import { useLocation } from 'react-router-dom'

const paginationURLParam = 'paginationIndex'
const RESULTS_PER_PAGE = 50

export function getActivePageFromSearch(
  search: string,
  lastPage: number,
): number {
  const query = parse(search, {
    parseNumbers: true,
  })
  const paginationIndex = _.isArray(query[paginationURLParam])
    ? query[paginationURLParam][0]
    : query[paginationURLParam]
  const parsedPaginationIndex = _.isNumber(paginationIndex)
    ? paginationIndex
    : Number(paginationIndex)

  if (!Number.isFinite(parsedPaginationIndex)) {
    return 0
  }

  return _.clamp(Math.trunc(parsedPaginationIndex), 0, lastPage)
}

function ResultPages({
  fragments,
  fragmentService,
  dossiersService,
  linesToShow,
  queryLemmas,
}: {
  fragments: readonly QueryItem[]
  fragmentService: FragmentService
  dossiersService: DossiersService
  linesToShow: number
  queryLemmas?: readonly string[]
}): JSX.Element {
  const location = useLocation()
  const pages = _.chunk(fragments, RESULTS_PER_PAGE)
  const lastPage = pages.length - 1
  const initialActivePage = getActivePageFromSearch(location.search, lastPage)
  const [active, setActive] = useState(initialActivePage)
  const displayActive = _.clamp(active, 0, lastPage)

  useEffect(() => {
    setActive(initialActivePage)
  }, [initialActivePage])

  const pageButtons = (
    <Row>
      <Col className="d-flex justify-content-center">
        <PaginationItems
          activePage={displayActive}
          lastPage={lastPage}
          setActivePage={setActive}
          paginationURLParam={paginationURLParam}
        />
      </Col>
    </Row>
  )

  return (
    <>
      {pageButtons}
      {pages[displayActive].map((fragment) => (
        <React.Fragment
          key={`${fragment.museumNumber}:${fragment.matchingLines.join(',')}`}
        >
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={fragment}
            active={displayActive}
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
    const isLineQuery = fragmentQuery.lemmas || fragmentQuery.transliteration
    const lineCountInfo = `${data.matchCountTotal.toLocaleString()} line${
      data.matchCountTotal === 1 ? '' : 's'
    } in `
    const showNumberSuggestion =
      fragmentCount === 0 && fragmentQuery.number?.match(/^[^.]+\s+[^.]+$/)
    const fixedNumber = fragmentQuery.number?.split(/\s+/).join('.')
    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            Found {isLineQuery && lineCountInfo}
            {`${fragmentCount.toLocaleString()} document${
              fragmentCount === 1 ? '' : 's'
            }`}
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

        {fragmentCount > 0 && (
          <ResultPages
            fragments={data.items}
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryLemmas={fragmentQuery.lemmas?.split('+')}
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

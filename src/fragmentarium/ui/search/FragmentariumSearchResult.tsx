import React, { useState } from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import { FragmentQuery } from 'query/FragmentQuery'
import { linesToShow } from './FragmentariumSearch'
import './FragmentariumSearchResult.sass'
import { stringify } from 'query-string'
import { ResultPageButtons } from 'common/ResultPageButtons'
import { FragmentLines } from './FragmentariumSearchResultComponents'
import DossiersService from 'dossiers/application/DossiersService'

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
  const [active, setActive] = useState(0)
  const RESULTS_PER_PAGE = 50
  const pages = _.chunk(fragments, RESULTS_PER_PAGE)

  const pageButtons = (
    <ResultPageButtons pages={pages} active={active} setActive={setActive} />
  )

  return (
    <>
      {pageButtons}
      {pages[active].map((fragment, index) => (
        <React.Fragment key={index}>
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={fragment}
            active={active}
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
    watch: ({ fragmentQuery }) => [fragmentQuery],
  },
)

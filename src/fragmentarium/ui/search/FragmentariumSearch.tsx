import React, { useState } from 'react'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/ui/SearchForm'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import 'fragmentarium/ui/search/FragmentariumSearch.css'
import withData from 'http/withData'
import { QueryService } from 'query/QueryService'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Pagination } from 'react-bootstrap'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/QueryRepository'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

interface Props {
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  queryService: QueryService
  fragmentQuery: FragmentQuery
}

function FragmentariumSearch({
  fragmentService,
  fragmentSearchService,
  queryService,
  fragmentQuery,
}: Props): JSX.Element {
  return (
    <AppContent
      crumbs={[new SectionCrumb('Fragmentarium'), new TextCrumb('Search')]}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Fragmentarium-search">
              <header className="Fragmentarium-search__header">
                <SearchGroup
                  fragmentSearchService={fragmentSearchService}
                  fragmentService={fragmentService}
                  fragmentQuery={fragmentQuery}
                />
              </header>
              {!_.isEmpty(fragmentQuery) && (
                <SearchResult
                  queryService={queryService}
                  fragmentService={fragmentService}
                  fragmentQuery={fragmentQuery}
                />
              )}
            </section>
          ) : (
            <p>Please log in to browse the Fragmentarium.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

function SubResultPages({
  fragments,
  fragmentService,
  linesToShow,
}: {
  fragments: readonly QueryItem[]
  fragmentService: FragmentService
  linesToShow: number
}): JSX.Element {
  const [active, setActive] = useState(0)
  const chunks = _(fragments).chunk(10).take(5).value()

  return (
    <>
      <Pagination>
        {chunks.map((_chunk, index) => {
          return (
            <Pagination.Item
              key={index}
              active={active === index}
              onClick={(event) => {
                event.preventDefault()
                setActive(index)
              }}
            >
              {index + 1}
            </Pagination.Item>
          )
        })}
      </Pagination>
      <ul>
        {chunks[active].map((fragment, index) => (
          <li key={index}>
            <GetFragment
              fragmentService={fragmentService}
              number={museumNumberToString(fragment.museumNumber)}
              lines={_.take(fragment.matchingLines, linesToShow)}
              active={active}
            />
            {fragment.matchCount > linesToShow && (
              <>And {fragment.matchCount - linesToShow} more</>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

const GetFragment = withData<
  unknown,
  {
    fragmentService: FragmentService
    number: string
    active: number
    lines: readonly number[]
  },
  Fragment
>(
  ({ data }): JSX.Element => (
    <>
      {data.number}
      {data.text.lines.map((line, index) => (
        <p key={index}>
          {line.content.map((token, index) => (
            <span key={index}>{token.value} </span>
          ))}
        </p>
      ))}
    </>
  ),
  ({ fragmentService, number, lines }) => fragmentService.find(number, lines),
  {
    watch: ({ active }) => [active],
  }
)

const SearchResult = withData<
  { fragmentService: FragmentService; fragmentQuery: FragmentQuery },
  { queryService: QueryService; fragmentQuery: FragmentQuery },
  QueryResult
>(
  ({ data, fragmentService, fragmentQuery }): JSX.Element => {
    const fragmentCount = data.items.length
    const isLineQuery = fragmentQuery.lemmas || fragmentQuery.transliteration
    const defaultLineLimit = 3
    return (
      <>
        <div>
          Found{' '}
          {isLineQuery &&
            `${data.matchCountTotal.toLocaleString()} matching line${
              data.matchCountTotal === 1 ? '' : 's'
            } in `}
          {`${fragmentCount.toLocaleString()} fragment${
            fragmentCount === 1 ? '' : 's'
          }`}
        </div>
        {fragmentCount > 0 && (
          <SubResultPages
            fragments={data.items}
            fragmentService={fragmentService}
            linesToShow={Math.max(
              _.trimEnd(fragmentQuery.transliteration || '').split('\n').length,
              defaultLineLimit
            )}
          />
        )}
      </>
    )
  },
  ({ queryService, fragmentQuery }) => queryService.query(fragmentQuery),
  {
    watch: ({ fragmentQuery }) => [fragmentQuery],
  }
)

export default FragmentariumSearch

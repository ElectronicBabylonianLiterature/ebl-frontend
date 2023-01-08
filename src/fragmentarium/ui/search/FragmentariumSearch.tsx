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
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'

interface Props {
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  queryService: QueryService
  fragmentQuery: FragmentQuery
}

const linesToShow = 5

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
  queryLemmas,
}: {
  fragments: readonly QueryItem[]
  fragmentService: FragmentService
  linesToShow: number
  queryLemmas?: readonly string[]
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

      <table>
        <tbody>
          {chunks[active].map((fragment, index) => (
            <React.Fragment key={index}>
              <GetFragment
                fragmentService={fragmentService}
                queryItem={fragment}
                active={active}
                queryLemmas={queryLemmas}
                linesToShow={linesToShow}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  )
}

const GetFragment = withData<
  {
    queryLemmas?: readonly string[]
    queryItem: QueryItem
    linesToShow: number
  },
  {
    fragmentService: FragmentService
    active: number
  },
  Fragment
>(
  ({ data: fragment, queryLemmas, queryItem, linesToShow }): JSX.Element => (
    <RenderFragmentLines
      fragment={fragment}
      linesToShow={linesToShow}
      totalLines={queryItem.matchingLines.length}
      lemmaIds={queryLemmas}
    />
  ),
  ({ fragmentService, queryItem, linesToShow }) =>
    fragmentService.find(
      museumNumberToString(queryItem.museumNumber),
      _.take(queryItem.matchingLines, linesToShow)
    ),
  {
    watch: ({ active }) => [active],
  }
)

const SearchResult = withData<
  { fragmentService: FragmentService; fragmentQuery: FragmentQuery },
  { queryService: QueryService },
  QueryResult
>(
  ({ data, fragmentService, fragmentQuery }): JSX.Element => {
    const fragmentCount = data.items.length
    const isLineQuery = fragmentQuery.lemmas || fragmentQuery.transliteration
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
            queryLemmas={fragmentQuery.lemmas?.split('+')}
            linesToShow={Math.max(
              _.trimEnd(fragmentQuery.transliteration || '').split('\n').length,
              linesToShow
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

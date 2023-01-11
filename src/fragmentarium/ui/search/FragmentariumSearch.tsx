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
import { Col, Pagination, Row } from 'react-bootstrap'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/QueryRepository'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import WordService from 'dictionary/application/WordService'
import FragmentLink from '../FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import ReferenceList from 'bibliography/ui/ReferenceList'

interface Props {
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  queryService: QueryService
  fragmentQuery: FragmentQuery
  wordService: WordService
}

const linesToShow = 5

function FragmentariumSearch({
  fragmentService,
  fragmentSearchService,
  queryService,
  fragmentQuery,
  wordService,
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
                  wordService={wordService}
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

      {chunks[active].map((fragment, index) => (
        <React.Fragment key={index}>
          <FragmentLines
            fragmentService={fragmentService}
            queryItem={fragment}
            active={active}
            queryLemmas={queryLemmas}
            linesToShow={linesToShow}
          />
        </React.Fragment>
      ))}
    </>
  )
}

function GenresDisplay({ genres }: { genres: Genres }): JSX.Element {
  return (
    <ul>
      {genres.genres.map((genreItem) => {
        const uncertain = genreItem.uncertain ? '(?)' : ''
        return (
          <ul key={genreItem.toString}>
            <small>{`${genreItem.category.join(' ➝ ')} ${uncertain}`}</small>
          </ul>
        )
      })}
    </ul>
  )
}

const FragmentLines = withData<
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
  ({ data: fragment, queryLemmas, queryItem, linesToShow }): JSX.Element => {
    const script = fragment.script.period.abbreviation
      ? ` (${fragment.script.period.abbreviation})`
      : ''
    return (
      <>
        <Row>
          <Col xs={3}>
            <h4>
              <FragmentLink number={fragment.number}>
                {fragment.number}
              </FragmentLink>
              {script}
            </h4>
          </Col>
          <Col className={'text-center text-secondary'}>
            <GenresDisplay genres={fragment.genres} />
          </Col>
        </Row>
        <Row>
          <Col xs={3} className={'text-secondary'}>
            <small>
              <ReferenceList references={fragment.references} />
            </small>
          </Col>
          <Col>
            <RenderFragmentLines
              fragment={fragment}
              linesToShow={linesToShow}
              totalLines={queryItem.matchingLines.length}
              lemmaIds={queryLemmas}
            />
          </Col>
        </Row>
        <hr />
      </>
    )
  },
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

import React, { Dispatch, SetStateAction, useState } from 'react'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import SearchForm from 'fragmentarium/ui/SearchForm'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import 'fragmentarium/ui/search/FragmentariumSearch.css'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Pagination, Row } from 'react-bootstrap'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import WordService from 'dictionary/application/WordService'
import FragmentLink from '../FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import ReferenceList from 'bibliography/ui/ReferenceList'

interface Props {
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  fragmentQuery: FragmentQuery
  wordService: WordService
}

const linesToShow = 5

function FragmentariumSearch({
  fragmentService,
  fragmentSearchService,
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
                <SearchForm
                  fragmentSearchService={fragmentSearchService}
                  fragmentService={fragmentService}
                  fragmentQuery={fragmentQuery}
                  wordService={wordService}
                />
              </header>
              {!_.isEmpty(fragmentQuery) && (
                <SearchResult
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

function ResultPagination({
  chunks,
  active,
  setActive,
}: {
  chunks: readonly QueryItem[][]
  active: number
  setActive: Dispatch<SetStateAction<number>>
}): JSX.Element {
  const chunkIndexes = _.range(chunks.length)

  const displayChunks: number[][] = []

  if (chunks.length <= 10) {
    displayChunks.push(chunkIndexes)
  } else {
    const showFirstEllipsis = active > 5
    const showSecondEllipsis = active < chunkIndexes.length - 6
    const activeChunk = chunkIndexes.slice(
      showFirstEllipsis ? active - 3 : 0,
      showSecondEllipsis ? active + 4 : chunkIndexes.length
    )

    if (showFirstEllipsis) {
      displayChunks.push([0])
    }

    displayChunks.push(activeChunk)

    if (showSecondEllipsis) {
      displayChunks.push(chunkIndexes.slice(-1))
    }
  }

  return (
    <Pagination>
      {displayChunks.map((pages, index) => {
        return (
          <React.Fragment key={index}>
            {index > 0 && <Pagination.Ellipsis />}
            {pages.map((index) => (
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
            ))}
          </React.Fragment>
        )
      })}
    </Pagination>
  )
}

function ResultPages({
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
  const chunks = _.chunk(fragments, 10)

  return (
    <>
      <ResultPagination chunks={chunks} active={active} setActive={setActive} />

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
  unknown,
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
          <ResultPages
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
  ({ fragmentService, fragmentQuery }) => fragmentService.query(fragmentQuery),
  {
    watch: ({ fragmentQuery }) => [fragmentQuery],
  }
)

export default FragmentariumSearch

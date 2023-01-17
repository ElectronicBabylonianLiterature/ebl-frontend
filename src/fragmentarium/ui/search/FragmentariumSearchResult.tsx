import React, { Dispatch, SetStateAction, useState } from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Pagination, Row } from 'react-bootstrap'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import FragmentLink from '../FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { linesToShow } from './FragmentariumSearch'

function createPages(chunks: readonly QueryItem[][], active: number) {
  const chunkIndexes = _.range(chunks.length)

  if (chunks.length <= 10) {
    return [chunkIndexes]
  }
  const displayChunks: number[][] = []
  const showEllipsis1 = active > 5
  const showEllipsis2 = active < chunkIndexes.length - 6

  const activeChunk = chunkIndexes.slice(
    showEllipsis1 ? active - 3 : 0,
    showEllipsis2 ? active + 4 : chunkIndexes.length
  )

  showEllipsis1 && displayChunks.push([0])
  displayChunks.push(activeChunk)
  showEllipsis2 && displayChunks.push(chunkIndexes.slice(-1))

  return displayChunks
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
  return (
    <Pagination>
      {createPages(chunks, active).map((pages, index) => {
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
export const SearchResult = withData<
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

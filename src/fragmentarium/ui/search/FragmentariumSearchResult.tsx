import React, { Dispatch, SetStateAction, useState } from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { CorpusQueryItem, QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Row, Pagination } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import FragmentLink from '../FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { linesToShow } from './FragmentariumSearch'
import './FragmentariumSearchResult.sass'
import DateDisplay from 'chronology/ui/DateDisplay'

function createPages(pages: readonly unknown[][], active: number) {
  const pageNumbers = _.range(pages.length)

  if (pages.length <= 10) {
    return [pageNumbers]
  }
  const buttonGroups: number[][] = []
  const showEllipsis1 = active > 5
  const showEllipsis2 = active < pageNumbers.length - 6

  const activeGroup = pageNumbers.slice(
    showEllipsis1 ? active - 3 : 0,
    showEllipsis2 ? active + 4 : pageNumbers.length
  )

  showEllipsis1 && buttonGroups.push([0])
  buttonGroups.push(activeGroup)
  showEllipsis2 && buttonGroups.push(pageNumbers.slice(-1))

  return buttonGroups
}

export function ResultPageButtons({
  pages,
  active,
  setActive,
}: {
  pages: (QueryItem | CorpusQueryItem)[][]
  active: number
  setActive: (number) => void
}): JSX.Element {
  return (
    <Row>
      <Col>
        <ResultPagination pages={pages} active={active} setActive={setActive} />
      </Col>
    </Row>
  )
}

export function ResultPagination({
  pages,
  active,
  setActive,
}: {
  pages: readonly unknown[][]
  active: number
  setActive: Dispatch<SetStateAction<number>>
}): JSX.Element {
  return (
    <Pagination className="justify-content-center">
      {createPages(pages, active).map((pages, index) => {
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
  const pages = _.chunk(fragments, 10)

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
        {fragment?.date && (
          <Row>
            <Col xs={3}>
              <DateDisplay date={fragment.date} />
            </Col>
          </Row>
        )}
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
  ({ fragmentService, queryItem, linesToShow }) => {
    const excludeLines = _.isEmpty(queryItem.matchingLines)
    return fragmentService.find(
      queryItem.museumNumber,
      _.take(queryItem.matchingLines, linesToShow),
      excludeLines
    )
  },
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
    const lineCountInfo = `${data.matchCountTotal.toLocaleString()} line${
      data.matchCountTotal === 1 ? '' : 's'
    } in `
    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            Found {isLineQuery && lineCountInfo}
            {`${fragmentCount.toLocaleString()} fragment${
              fragmentCount === 1 ? '' : 's'
            }`}
          </Col>
        </Row>

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

import React, { useState } from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Container, Row } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import FragmentLink from '../FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { linesToShow } from './FragmentariumSearch'
import './FragmentariumSearchResult.sass'
import DateDisplay from 'fragmentarium/ui/info/DateDisplay'
import { stringify } from 'query-string'
import { ResultPageButtons } from 'common/ResultPageButtons'
import { ProjectList } from '../info/ResearchProjects'
import { RecordList } from 'fragmentarium/ui/info/Record'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'

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

function TransliterationRecord({
  record,
  className,
}: {
  record: readonly RecordEntry[]
  className?: string
}): JSX.Element {
  const latestRecord = _(record)
    .filter((record) => record.type === 'Transliteration')
    .first()
  return (
    <RecordList
      record={latestRecord ? [latestRecord] : []}
      className={className}
    />
  )
}

function ResponsiveCol({ ...props }): JSX.Element {
  return <Col xs={12} sm={4} {...props}></Col>
}

export const FragmentLines = withData<
  {
    queryLemmas?: readonly string[]
    queryItem: QueryItem
    linesToShow: number
    includeLatestRecord?: boolean
  },
  {
    fragmentService: FragmentService
    active?: number
  },
  Fragment
>(
  ({
    data: fragment,
    queryLemmas,
    queryItem,
    linesToShow,
    includeLatestRecord,
  }): JSX.Element => {
    const script = fragment.script.period.abbreviation
      ? ` (${fragment.script.period.abbreviation})`
      : ''
    return (
      <Container>
        <Row className={'fragment-result__header'}>
          <ResponsiveCol>
            <h4 className={'fragment-result__fragment-number'}>
              <FragmentLink number={fragment.number}>
                {fragment.number}
              </FragmentLink>
              {script}
            </h4>
            <small>
              <p className={'fragment-result__accession'}>
                {fragment.accession && 'Accession no.: '}
                {fragment.accession}
              </p>
              <p>
                {fragment.archaeology?.excavationNumber && 'Excavation no.: '}
                {fragment.archaeology?.excavationNumber}
              </p>
            </small>
          </ResponsiveCol>
          <ResponsiveCol className={'text-secondary fragment-result__genre'}>
            <GenresDisplay genres={fragment.genres} />
          </ResponsiveCol>
          <ResponsiveCol>
            {includeLatestRecord && (
              <TransliterationRecord
                record={fragment.uniqueRecord}
                className={'fragment-result__record'}
              />
            )}
          </ResponsiveCol>
        </Row>
        {fragment?.date && (
          <Row>
            <ResponsiveCol>
              <DateDisplay date={fragment.date} />
            </ResponsiveCol>
          </Row>
        )}
        <Row>
          <ResponsiveCol className={'text-secondary'}>
            <small>
              <ReferenceList references={fragment.references} />
            </small>
          </ResponsiveCol>
          <ResponsiveCol className={'mt-4 mb-4 mt-sm-0 mb-sm-0'}>
            <RenderFragmentLines
              fragment={fragment}
              linesToShow={linesToShow}
              totalLines={queryItem.matchingLines.length}
              lemmaIds={queryLemmas}
            />
          </ResponsiveCol>
          <ResponsiveCol className={'fragment-result__project-logos'}>
            <ProjectList projects={fragment.projects} />
          </ResponsiveCol>
        </Row>
        <hr />
      </Container>
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
    const showNumberSuggestion =
      fragmentCount === 0 && fragmentQuery.number?.match(/^[^.]+\s+[^.]+$/)
    const fixedNumber = fragmentQuery.number?.split(/\s+/).join('.')
    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            Found {isLineQuery && lineCountInfo}
            {`${fragmentCount.toLocaleString()} fragment${
              fragmentCount === 1 ? '' : 's'
            }`}
            {showNumberSuggestion && (
              <>
                {'. Did you mean'}
                &nbsp;
                <a
                  href={`/fragmentarium/search?${stringify({
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

import React, { useState } from 'react'
import _ from 'lodash'
import FragmentService, {
  ThumbnailBlob,
} from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Col, Container, Row } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import FragmentLink, { createFragmentUrl } from '../FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { linesToShow } from './FragmentariumSearch'
import './FragmentariumSearchResult.sass'
import DateDisplay from 'chronology/ui/DateDisplay'
import { stringify } from 'query-string'
import { ResultPageButtons } from 'common/ResultPageButtons'
import { ProjectList } from '../info/ResearchProjects'
import { RecordList } from 'fragmentarium/ui/info/Record'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import ErrorBoundary from 'common/ErrorBoundary'
import { ThumbnailImage } from 'common/BlobImage'

const itemsPerPage = 10

function ResultPages({
  queryItems,
  fragmentService,
  linesToShow,
  queryLemmas,
}: {
  queryItems: readonly QueryItem[]
  fragmentService: FragmentService
  linesToShow: number
  queryLemmas?: readonly string[]
}): JSX.Element {
  const [active, setActive] = useState(0)
  const pages = _.chunk(queryItems, itemsPerPage)
  const pageButtons = (
    <ResultPageButtons pages={pages} active={active} setActive={setActive} />
  )
  const activePage = pages[active]

  return (
    <>
      {pageButtons}
      <FragmentLinesSerial
        queryLemmas={queryLemmas}
        queryItems={activePage}
        fragmentService={fragmentService}
        linesToShow={linesToShow}
        active={active}
      />
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

const FragmentThumbnail = withData<
  { fragment: Fragment },
  { fragmentService: FragmentService },
  ThumbnailBlob
>(
  ({ data, fragment }) => {
    return data.blob ? (
      <ThumbnailImage
        photo={data.blob}
        alt={`Preview of ${fragment.number}`}
        url={createFragmentUrl(fragment.number)}
      />
    ) : (
      <></>
    )
  },
  ({ fragment, fragmentService }) =>
    fragmentService.findThumbnail(fragment, 'small')
)

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

function DisplayFragmentLines({
  data: fragment,
  queryLemmas,
  queryItem,
  linesToShow,
  includeLatestRecord,
  fragmentService,
}: {
  data: Fragment
  queryLemmas?: readonly string[]
  queryItem: QueryItem
  linesToShow: number
  includeLatestRecord?: boolean
  fragmentService: FragmentService
}): JSX.Element {
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
          <div className="fragment-result__archaeology-info">
            <small>
              <p>
                {fragment.accession && 'Accession no.: '}
                {fragment.accession}
              </p>
              <p>
                {fragment.archaeology?.excavationNumber && 'Excavation no.: '}
                {fragment.archaeology?.excavationNumber}
              </p>
              <p>
                {fragment.archaeology?.site?.name && 'Provenance: '}
                {fragment.archaeology?.site?.name}
              </p>
            </small>
          </div>
          <ProjectList projects={fragment.projects} />
        </ResponsiveCol>
        <ResponsiveCol className={'text-secondary fragment-result__genre'}>
          <GenresDisplay genres={fragment.genres} />
        </ResponsiveCol>
        <ResponsiveCol className={'fragment-result__record'}>
          {includeLatestRecord && (
            <TransliterationRecord record={fragment.uniqueRecord} />
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
        <ResponsiveCol className={'fragment-result__preview'}>
          <ErrorBoundary>
            {fragment.hasPhoto && (
              <FragmentThumbnail
                fragmentService={fragmentService}
                fragment={fragment}
              />
            )}
          </ErrorBoundary>
        </ResponsiveCol>
      </Row>
      <hr />
    </Container>
  )
}

export const FragmentLines = withData<
  {
    queryLemmas?: readonly string[]
    queryItem: QueryItem
    linesToShow: number
    includeLatestRecord?: boolean
    fragmentService: FragmentService
  },
  {
    active?: number
  },
  Fragment
>(
  DisplayFragmentLines,
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

const FragmentLinesSerial = withData<
  {
    queryLemmas?: readonly string[]
    queryItems: readonly QueryItem[]
    linesToShow: number
    includeLatestRecord?: boolean
    fragmentService: FragmentService
  },
  { active: number },
  readonly Fragment[]
>(
  ({ data: fragments, ...props }): JSX.Element => {
    console.log(fragments.length, props.queryItems.length)
    return fragments.length === props.queryItems.length ? (
      <>
        {fragments.map((fragment, index) => (
          <DisplayFragmentLines
            key={index}
            data={fragment}
            queryItem={props.queryItems[index]}
            {...props}
          />
        ))}
      </>
    ) : (
      <></>
    )
  },
  ({ fragmentService, queryItems, linesToShow }) => {
    return fragmentService.findFragmentsForPreview(queryItems, linesToShow)
  },
  {
    watch: (props) => [props.active],
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
            queryItems={data.items}
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

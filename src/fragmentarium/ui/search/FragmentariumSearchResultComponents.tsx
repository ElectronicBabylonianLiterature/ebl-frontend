import React from 'react'
import _ from 'lodash'
import FragmentService, {
  ThumbnailBlob,
} from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { QueryItem } from 'query/QueryResult'
import { Col, Container, Row } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import FragmentLink, { createFragmentUrl } from '../FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import ReferenceList from 'bibliography/ui/ReferenceList'
import './FragmentariumSearchResult.sass'
import DateDisplay from 'chronology/ui/DateDisplay'
import { ProjectList } from '../info/ResearchProjects'
import { RecordList } from 'fragmentarium/ui/info/Record'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import ErrorBoundary from 'common/ErrorBoundary'
import { ThumbnailImage } from 'common/BlobImage'
import { DossiersGroupedDisplay } from 'dossiers/ui/DossiersGroupedDisplay'
import DossiersService from 'dossiers/application/DossiersService'
import DossierRecord from 'dossiers/domain/DossierRecord'
import Bluebird from 'bluebird'

/**
 * Component for displaying grouped dossiers in search results
 * Fetches dossier data and renders them grouped by script and provenance
 */
const FragmentDossiersGrouped = withData<
  unknown,
  {
    dossiersService: DossiersService
    fragment: Fragment
  },
  { records: readonly DossierRecord[] }
>(
  ({ data }) => <DossiersGroupedDisplay records={data.records} />,
  (props) => {
    return Bluebird.resolve(
      props.dossiersService
        .queryByIds([
          ...props.fragment.dossiers.map((record) => record.dossierId),
        ])
        .then((records) => ({ records })),
    )
  },
  {
    watch: (props) => [...props.fragment.dossiers],
    filter: (props) => !_.isEmpty(props.fragment.dossiers),
    defaultData: () => ({ records: [] }),
  },
)

function GenresDisplay({ genres }: { genres: Genres }): JSX.Element {
  return (
    <ul>
      {genres.genres.map((genreItem, index) => {
        return (
          <ul key={index}>
            <small>{genreItem.toString()}</small>
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
    fragmentService.findThumbnail(fragment, 'small'),
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

export const FragmentLines = withData<
  {
    queryLemmas?: readonly string[]
    queryItem: QueryItem
    linesToShow: number
    includeLatestRecord?: boolean
    fragmentService: FragmentService
    dossiersService: DossiersService
  },
  {
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
    fragmentService,
    dossiersService,
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
                <FragmentDossiersGrouped
                  dossiersService={dossiersService}
                  fragment={fragment}
                />
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
  },
  ({ fragmentService, queryItem, linesToShow }) => {
    const excludeLines = _.isEmpty(queryItem.matchingLines)
    return fragmentService.find(
      queryItem.museumNumber,
      _.take(queryItem.matchingLines, linesToShow),
      excludeLines,
    )
  },
  {
    watch: ({ active }) => [active],
  },
)

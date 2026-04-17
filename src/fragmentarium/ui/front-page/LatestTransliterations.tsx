import React from 'react'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryResult, QueryItem } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import DateDisplay from 'chronology/ui/DateDisplay'
import ReferenceList from 'bibliography/ui/ReferenceList'
import FragmentDossierRecordsDisplay from 'dossiers/ui/DossiersDisplay'
import { RenderFragmentLines } from 'dictionary/ui/search/FragmentLemmaLines'
import './LatestTransliterations.css'

const LATEST_COUNT = 5
const LIBRARY_MAX_ITEMS = 20

type LatestTransliterationsMode = 'homepage' | 'library'

interface LatestTransliterationsProps {
  fragmentService: FragmentService
  dossiersService: DossiersService
  mode?: LatestTransliterationsMode
}

function formatRecordDate(entry: RecordEntry): string {
  if (entry.isHistorical) return 'Historical'
  try {
    return DateTime.fromISO(entry.date).toFormat('LLL d, yyyy')
  } catch {
    return entry.date
  }
}

function FragmentCard({
  fragment,
  queryItem,
  mode,
  dossiersService,
}: {
  fragment: Fragment
  queryItem: QueryItem
  mode: LatestTransliterationsMode
  dossiersService: DossiersService
}): JSX.Element {
  const period = fragment.script?.period?.name
  const latestEntry = fragment.uniqueRecord[0]
  const isLibraryMode = mode === 'library'
  const description = fragment.description
    .split('\n')
    .find((line) => line.trim())

  return (
    <div className="latest-card">
      <div className="latest-card__top">
        <FragmentLink number={fragment.number}>
          <span className="latest-card__number">{fragment.number}</span>
        </FragmentLink>
        {period && <span className="latest-card__period">{period}</span>}
      </div>
      {fragment.collection && (
        <p className="latest-card__collection">{fragment.collection}</p>
      )}
      {description && <p className="latest-card__description">{description}</p>}
      {isLibraryMode && queryItem.matchingLines.length > 0 && (
        <div className="latest-card__lines">
          <RenderFragmentLines
            fragment={fragment}
            linesToShow={3}
            totalLines={queryItem.matchingLines.length}
          />
        </div>
      )}
      {isLibraryMode && (
        <div className="latest-card__details">
          {fragment.accession && (
            <p className="latest-card__meta-line">
              <span className="latest-card__meta-label">Accession no.:</span>{' '}
              {fragment.accession}
            </p>
          )}
          {fragment.archaeology?.excavationNumber && (
            <p className="latest-card__meta-line">
              <span className="latest-card__meta-label">Excavation no.:</span>{' '}
              {fragment.archaeology.excavationNumber}
            </p>
          )}
          {fragment.archaeology?.site?.name && (
            <p className="latest-card__meta-line">
              <span className="latest-card__meta-label">Provenance:</span>{' '}
              {fragment.archaeology.site.name}
            </p>
          )}
          {fragment.dossiers.length > 0 && (
            <p className="latest-card__meta-line">
              <FragmentDossierRecordsDisplay
                dossiersService={dossiersService}
                fragment={fragment}
              />
            </p>
          )}
          {fragment.genres.genres.length > 0 && (
            <ul className="latest-card__genres">
              {fragment.genres.genres.map((genreItem, index) => (
                <li key={index}>{genreItem.toString()}</li>
              ))}
            </ul>
          )}
          {fragment.date && (
            <div className="latest-card__date-display">
              <DateDisplay date={fragment.date} />
            </div>
          )}
          {fragment.references.length > 0 && (
            <div className="latest-card__references">
              <span className="latest-card__meta-label">References</span>
              <small>
                <ReferenceList references={fragment.references} />
              </small>
            </div>
          )}
        </div>
      )}
      {latestEntry && (
        <div className="latest-card__footer">
          <span className="latest-card__editor">{latestEntry.user}</span>
          <span className="latest-card__date">
            {formatRecordDate(latestEntry)}
          </span>
        </div>
      )}
    </div>
  )
}

const FragmentCardLoader = withData<
  {
    fragmentService: FragmentService
    dossiersService: DossiersService
    mode: LatestTransliterationsMode
    queryItem: QueryItem
  },
  {
    fragmentService: FragmentService
    dossiersService: DossiersService
    mode: LatestTransliterationsMode
    queryItem: QueryItem
  },
  Fragment
>(
  ({ data: fragment, mode, dossiersService, queryItem }) => (
    <FragmentCard
      fragment={fragment}
      queryItem={queryItem}
      mode={mode}
      dossiersService={dossiersService}
    />
  ),
  ({ fragmentService, queryItem }) =>
    fragmentService.find(
      queryItem.museumNumber,
      queryItem.matchingLines.slice(0, 3),
      queryItem.matchingLines.length === 0,
    ),
)

function LatestAdditions({
  data,
  fragmentService,
  dossiersService,
  mode,
}: {
  data: QueryResult
  fragmentService: FragmentService
  dossiersService: DossiersService
  mode: LatestTransliterationsMode
}): JSX.Element {
  const isHomepageMode = mode === 'homepage'
  const items = isHomepageMode
    ? data.items.slice(0, LATEST_COUNT)
    : data.items.slice(0, LIBRARY_MAX_ITEMS)
  return (
    <section className="latest-additions">
      <div className="latest-additions__header">
        <div>
          <h3 className="latest-additions__title">
            {isHomepageMode ? 'Latest Additions' : 'Latest Transliterations'}
          </h3>
          <p className="latest-additions__subtitle">
            {isHomepageMode
              ? 'Recently transliterated tablets'
              : 'Most recently updated editions'}
          </p>
        </div>
        {isHomepageMode && (
          <Link to="/library" className="latest-additions__view-all">
            View all &rarr;
          </Link>
        )}
      </div>
      <div className="latest-additions__grid">
        {items.map((queryItem) => (
          <FragmentCardLoader
            key={queryItem.museumNumber}
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            mode={mode}
            queryItem={queryItem}
          />
        ))}
      </div>
    </section>
  )
}

export default withData<
  LatestTransliterationsProps,
  LatestTransliterationsProps,
  QueryResult
>(
  ({ data, fragmentService, dossiersService, mode = 'library' }) => (
    <LatestAdditions
      data={data}
      fragmentService={fragmentService}
      dossiersService={dossiersService}
      mode={mode}
    />
  ),
  (props) => props.fragmentService.queryLatest(),
)

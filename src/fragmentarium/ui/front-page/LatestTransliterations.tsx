import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import { Container } from 'react-bootstrap'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLines } from 'fragmentarium/ui/search/FragmentariumSearchResultComponents'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'

export const LATEST_PREVIEW_COUNT = 5

const CompactFragmentCard = withData<
  { queryItem: QueryItem },
  { fragmentService: FragmentService },
  Fragment
>(
  ({ data: fragment }): JSX.Element => {
    const periodAbbr = fragment.script.period.abbreviation
    const latestRecord = _(fragment.uniqueRecord)
      .filter(
        (entry) => entry.type === 'Transliteration' && !entry.isHistorical,
      )
      .first()
    const recordDate = latestRecord
      ? DateTime.fromISO(latestRecord.date).toFormat('d LLL yyyy')
      : null
    const descriptionFirstLine = fragment.description.split('\n')[0] || null
    return (
      <Link
        to={createFragmentUrl(fragment.number)}
        className="latest-addition-card"
      >
        <div className="latest-addition-card__body">
          <div className="latest-addition-card__header">
            <div className="latest-addition-card__number">
              {fragment.number}
              {periodAbbr && (
                <span className="latest-addition-card__period">
                  {' '}
                  ({periodAbbr})
                </span>
              )}
            </div>
            {recordDate && (
              <div className="latest-addition-card__date">{recordDate}</div>
            )}
          </div>
          {descriptionFirstLine && (
            <div className="latest-addition-card__description">
              {descriptionFirstLine}
            </div>
          )}
          {fragment.projects.length > 0 && (
            <div className="latest-addition-card__projects">
              {fragment.projects.map((project) => (
                <img
                  key={project.name}
                  className="latest-addition-card__project-logo"
                  src={project.logo}
                  alt={project.name}
                  title={project.name}
                />
              ))}
            </div>
          )}
        </div>
        <span className="latest-addition-card__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    )
  },
  ({ fragmentService, queryItem }) =>
    fragmentService.find(queryItem.museumNumber, [], true),
)

function LatestTransliterationsPreview({
  data,
  fragmentService,
}: {
  data: QueryResult
  fragmentService: FragmentService
}): JSX.Element {
  const previewItems = data.items.slice(0, LATEST_PREVIEW_COUNT)
  return (
    <section className="latest-additions-preview">
      <Container>
        <div className="latest-additions-preview__header">
          <h2 className="latest-additions-preview__title">Latest Additions</h2>
          <Link
            to="/library"
            className="latest-additions-preview__view-all-btn"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            View all in Library
          </Link>
        </div>
        <div className="latest-additions-preview__list">
          {previewItems.map((queryItem) => (
            <CompactFragmentCard
              key={queryItem.museumNumber}
              queryItem={queryItem}
              fragmentService={fragmentService}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

function LatestTransliterationsAll({
  data,
  fragmentService,
  dossiersService,
}: {
  data: QueryResult
  fragmentService: FragmentService
  dossiersService: DossiersService
}): JSX.Element {
  return (
    <section className="library-latest">
      <h2 className="library-latest__title">Latest Additions</h2>
      <div className="library-latest__list">
        {data.items.map((fragment) => (
          <div key={fragment.museumNumber} className="library-fragment-card">
            <FragmentLines
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              queryItem={fragment}
              linesToShow={3}
              includeLatestRecord={true}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default withData<
  {
    fragmentService: FragmentService
    dossiersService: DossiersService
    preview?: boolean
  },
  unknown,
  QueryResult
>(
  ({ data, fragmentService, dossiersService, preview }): JSX.Element => {
    if (preview) {
      return (
        <LatestTransliterationsPreview
          data={data}
          fragmentService={fragmentService}
        />
      )
    }
    return (
      <LatestTransliterationsAll
        data={data}
        fragmentService={fragmentService}
        dossiersService={dossiersService}
      />
    )
  },
  (props) => props.fragmentService.queryLatest(),
)

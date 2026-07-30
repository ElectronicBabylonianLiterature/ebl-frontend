import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import withData from 'http/withData'
import FragmentService, {
  ThumbnailBlob,
} from 'fragmentarium/application/FragmentService'
import { QueryItem } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import { ThumbnailImage } from 'common/ui/BlobImage'
import useNearViewport from 'common/hooks/useNearViewport'

const LATEST_CARD_LINES_TO_SHOW = 3

export function hasLatestTransliterationRecord(fragment: Fragment): boolean {
  return _(fragment.uniqueRecord).some(
    (entry) => entry.type === 'Transliteration' && !entry.isHistorical,
  )
}

export function LatestAdditionSummaryThumbnail({
  fragment,
  thumbnailPath,
}: {
  fragment: Fragment
  thumbnailPath: string | null
}): JSX.Element {
  const [isBroken, setIsBroken] = React.useState(false)

  return thumbnailPath && !isBroken ? (
    <div className="latest-addition-card__thumbnail">
      <img
        src={thumbnailPath}
        alt={`Preview of ${fragment.number}`}
        loading="lazy"
        decoding="async"
        onError={() => setIsBroken(true)}
      />
    </div>
  ) : (
    <></>
  )
}

const LatestAdditionThumbnail = withData<
  { fragment: Fragment; fragmentService: FragmentService },
  unknown,
  ThumbnailBlob
>(
  ({ data, fragment }): JSX.Element =>
    data.blob ? (
      <div className="latest-addition-card__thumbnail">
        <ThumbnailImage
          photo={data.blob}
          alt={`Preview of ${fragment.number}`}
        />
      </div>
    ) : (
      <></>
    ),
  ({ fragment, fragmentService }) =>
    fragmentService.findThumbnail(fragment, 'small'),
)

function CompactFragmentCardContent({
  fragment,
  fragmentService,
  queryItem,
}: {
  fragment: Fragment
  fragmentService: FragmentService
  queryItem: QueryItem
}): JSX.Element {
  const { containerRef: thumbnailContainerRef, isNearViewport } =
    useNearViewport()
  const periodAbbr = fragment.script.period.abbreviation
  const latestRecord = _(fragment.uniqueRecord)
    .filter((entry) => entry.type === 'Transliteration' && !entry.isHistorical)
    .first()
  const recordDate = latestRecord
    ? DateTime.fromISO(latestRecord.date).toFormat('d LLL yyyy')
    : null
  const descriptionFirstLine = fragment.description.split('\n')[0] || null
  const usesSummaryThumbnail = 'thumbnailPath' in queryItem

  return (
    <Link
      to={createFragmentUrl(fragment.number)}
      className="latest-addition-card"
    >
      <div ref={thumbnailContainerRef}>
        {fragment.hasPhoto && isNearViewport && (
          <ErrorBoundary>
            {usesSummaryThumbnail ? (
              <LatestAdditionSummaryThumbnail
                fragment={fragment}
                thumbnailPath={queryItem.thumbnailPath ?? null}
              />
            ) : (
              <LatestAdditionThumbnail
                fragmentService={fragmentService}
                fragment={fragment}
              />
            )}
          </ErrorBoundary>
        )}
      </div>
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
            {fragment.projects.map((project) =>
              project.logo ? (
                <img
                  key={project.name}
                  className="latest-addition-card__project-logo"
                  src={project.logo}
                  alt={project.name}
                  title={project.name}
                  loading="lazy"
                  decoding="async"
                />
              ) : null,
            )}
          </div>
        )}
      </div>
      <span className="latest-addition-card__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

const HydratedCompactFragmentCard = withData<
  { queryItem: QueryItem; fragmentService: FragmentService },
  unknown,
  Fragment
>(
  ({ data: fragment, fragmentService, queryItem }): JSX.Element => (
    <CompactFragmentCardContent
      fragment={fragment}
      fragmentService={fragmentService}
      queryItem={queryItem}
    />
  ),
  ({ fragmentService, queryItem }) => {
    const lines = _.take(queryItem.matchingLines, LATEST_CARD_LINES_TO_SHOW)
    const excludeLines = _.isEmpty(queryItem.matchingLines)
    return fragmentService.find(queryItem.museumNumber, lines, excludeLines)
  },
)

export function CompactFragmentCard({
  queryItem,
  fragmentService,
}: {
  queryItem: QueryItem
  fragmentService: FragmentService
}): JSX.Element {
  return queryItem.fragment &&
    hasLatestTransliterationRecord(queryItem.fragment) ? (
    <CompactFragmentCardContent
      fragment={queryItem.fragment}
      fragmentService={fragmentService}
      queryItem={queryItem}
    />
  ) : (
    <HydratedCompactFragmentCard
      queryItem={queryItem}
      fragmentService={fragmentService}
    />
  )
}

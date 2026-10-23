import React from 'react'
import withData from 'http/withData'
import type FragmentService from 'fragmentarium/application/FragmentService'
import type { ThumbnailBlob } from 'fragmentarium/application/FragmentService'
import type { Fragment } from 'fragmentarium/domain/fragment'
import type { QueryItem } from 'query/QueryResult'
import { ThumbnailImage } from 'common/ui/BlobImage'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'
import SummaryThumbnail from 'fragmentarium/ui/search/SummaryThumbnail'
import MediaSummaryThumbnail from 'fragmentarium/ui/images/MediaSummaryThumbnail'

interface Props {
  fragment: Fragment
  fragmentService: Pick<FragmentService, 'findThumbnail'>
  queryItem: QueryItem
  linked?: boolean
}

const LegacyThumbnail = withData<Props, object, ThumbnailBlob>(
  ({ data, fragment, linked = true }) =>
    data.blob ? (
      <ThumbnailImage
        photo={data.blob}
        alt={`Preview of ${fragment.number}`}
        url={linked ? createFragmentUrl(fragment.number) : undefined}
      />
    ) : (
      <></>
    ),
  ({ fragment, fragmentService }) =>
    fragmentService.findThumbnail(fragment, 'small'),
)

export default function FragmentCardThumbnail(props: Props): JSX.Element {
  const { fragment, queryItem, linked = true } = props
  const hasLegacyPhoto = fragment.legacyHasPhoto ?? fragment.hasPhoto
  const fallback = !hasLegacyPhoto ? null : 'thumbnailPath' in queryItem ? (
    <SummaryThumbnail
      fragmentNumber={fragment.number}
      thumbnailPath={queryItem.thumbnailPath ?? null}
      linked={linked}
    />
  ) : (
    <LegacyThumbnail {...props} />
  )
  return (
    <MediaSummaryThumbnail
      fragment={fragment}
      fallback={fallback}
      linked={linked}
    />
  )
}

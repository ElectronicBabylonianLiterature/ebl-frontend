import React from 'react'
import _ from 'lodash'
import FragmentService, {
  ThumbnailBlob,
} from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import { Col, Image } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import { RecordList } from 'fragmentarium/ui/info/Record'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { ThumbnailImage } from 'common/ui/BlobImage'

export function GenresDisplay({ genres }: { genres: Genres }): JSX.Element {
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

export const FragmentThumbnail = withData<
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

export function SummaryThumbnail({
  fragmentNumber,
  thumbnailPath,
}: {
  fragmentNumber: string
  thumbnailPath: string | null
}): JSX.Element {
  const [isBroken, setIsBroken] = React.useState(false)

  if (!thumbnailPath || isBroken) {
    return <></>
  }

  return (
    <a href={createFragmentUrl(fragmentNumber)}>
      <Image
        src={thumbnailPath}
        alt={`Preview of ${fragmentNumber}`}
        fluid
        loading="lazy"
        decoding="async"
        onError={() => setIsBroken(true)}
      />
    </a>
  )
}

export function TransliterationRecord({
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

export function ResponsiveCol({ ...props }): JSX.Element {
  return <Col xs={12} sm={4} {...props}></Col>
}

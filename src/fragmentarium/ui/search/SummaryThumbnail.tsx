import useObjectUrl from 'common/hooks/useObjectUrl'
import React from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ui/ExternalLink'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'
import { apiUrl } from 'http/ApiClient'

export default function SummaryThumbnail({
  fragmentNumber,
  thumbnailPath,
  image: imageBlob,
  linked = true,
}: {
  fragmentNumber: string
  thumbnailPath: string | null
  image?: Blob | null
  linked?: boolean
}): JSX.Element {
  const objectUrl = useObjectUrl(imageBlob)
  const [isBroken, setIsBroken] = React.useState(false)

  const thumbnailUrl =
    objectUrl ??
    (thumbnailPath
      ? /^https?:\/\//i.test(thumbnailPath)
        ? thumbnailPath
        : apiUrl(thumbnailPath)
      : null)
  if (!thumbnailUrl || isBroken) {
    return <></>
  }

  const image = (
    <Image
      src={thumbnailUrl}
      alt={`Preview of ${fragmentNumber}`}
      fluid
      loading="lazy"
      decoding="async"
      onError={() => setIsBroken(true)}
    />
  )

  return linked ? (
    <ExternalLink href={createFragmentUrl(fragmentNumber)}>
      {image}
    </ExternalLink>
  ) : (
    image
  )
}

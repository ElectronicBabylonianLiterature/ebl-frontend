import React from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ui/ExternalLink'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'
import { apiUrl } from 'http/ApiClient'

export default function SummaryThumbnail({
  fragmentNumber,
  thumbnailPath,
  linked = true,
}: {
  fragmentNumber: string
  thumbnailPath: string | null
  linked?: boolean
}): JSX.Element {
  const [isBroken, setIsBroken] = React.useState(false)

  if (!thumbnailPath || isBroken) {
    return <></>
  }

  const thumbnailUrl = /^https?:\/\//i.test(thumbnailPath)
    ? thumbnailPath
    : apiUrl(thumbnailPath)
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

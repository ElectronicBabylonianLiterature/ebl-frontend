import React from 'react'
import { Image } from 'react-bootstrap'
import { createFragmentUrl } from 'fragmentarium/ui/FragmentLink'

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

  const image = (
    <Image
      src={thumbnailPath}
      alt={`Preview of ${fragmentNumber}`}
      fluid
      loading="lazy"
      decoding="async"
      onError={() => setIsBroken(true)}
    />
  )

  return linked ? (
    <a href={createFragmentUrl(fragmentNumber)}>{image}</a>
  ) : (
    image
  )
}

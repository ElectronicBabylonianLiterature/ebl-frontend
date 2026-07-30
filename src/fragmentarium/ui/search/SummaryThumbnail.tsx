import React from 'react'
import { Image } from 'react-bootstrap'
import { createFragmentUrl } from '../FragmentLink'

export default function SummaryThumbnail({
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

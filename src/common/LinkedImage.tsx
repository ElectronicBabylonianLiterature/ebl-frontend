import React from 'react'

import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ExternalLink'

type Props = {
  src: string
  alt: string
}

export default function LinkedImage({ src, alt }: Props): JSX.Element {
  return (
    <ExternalLink href={src}>
      <Image src={src} alt={alt} fluid />
    </ExternalLink>
  )
}

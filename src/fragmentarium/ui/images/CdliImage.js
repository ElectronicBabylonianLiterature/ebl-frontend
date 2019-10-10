import React from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ExternalLink'

export default function CdliImage({ src }) {
  return (
    <ExternalLink href={src}>
      <Image src={src} alt="CDLI photo" fluid />
    </ExternalLink>
  )
}

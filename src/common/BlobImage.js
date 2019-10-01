// @flow
import React, { useEffect } from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from './ExternalLink'

export default function BlobImage({
  data,
  hasLink,
  alt
}: {
  data: Blob,
  hasLink?: boolean,
  alt?: string
}) {
  const objectUrl = URL.createObjectURL(data)
  useEffect(() => () => URL.revokeObjectURL(objectUrl))

  const image = <Image src={objectUrl} alt={alt} fluid />
  return hasLink ? (
    <ExternalLink href={objectUrl}> {image} </ExternalLink>
  ) : (
    image
  )
}

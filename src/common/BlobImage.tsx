import React from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from './ExternalLink'
import useObjectUrl from './useObjectUrl'

export default function BlobImage({
  data,
  hasLink,
  alt,
}: {
  data: Blob
  hasLink?: boolean
  alt?: string
}): JSX.Element {
  const objectUrl = useObjectUrl(data)

  const image = <Image src={objectUrl} alt={alt} fluid />
  return hasLink ? (
    <ExternalLink href={objectUrl}> {image} </ExternalLink>
  ) : (
    image
  )
}

export function ThumbnailImage({
  photo,
  url,
  alt,
}: {
  photo: Blob
  url?: string
  alt?: string
}): JSX.Element {
  const image = <Image src={useObjectUrl(photo)} alt={alt} fluid />
  return url ? <ExternalLink href={url}>{image}</ExternalLink> : image
}

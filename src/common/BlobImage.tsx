import React from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from './ExternalLink'
import useObjectUrl from './useObjectUrl'
import './BlobImage.css'

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
  const thumbnailUrl = useObjectUrl(photo)
  const image = (
    <img
      src={thumbnailUrl}
      alt={alt}
      className="BlobImage__thumbnail"
      loading="lazy"
      decoding="async"
      width={72}
      height={48}
    />
  )
  return url ? <ExternalLink href={url}>{image}</ExternalLink> : image
}

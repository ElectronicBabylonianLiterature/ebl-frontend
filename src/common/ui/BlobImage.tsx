import React from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ui/ExternalLink'
import useObjectUrl from 'common/hooks/useObjectUrl'

export default function BlobImage({
  data,
  hasLink,
  alt,
  loading = 'lazy',
  decoding = 'async',
}: {
  data: Blob
  hasLink?: boolean
  alt?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
}): JSX.Element {
  const objectUrl = useObjectUrl(data)
  if (!objectUrl) {
    return <></>
  }

  const image = (
    <Image
      src={objectUrl}
      alt={alt}
      fluid
      loading={loading}
      decoding={decoding}
    />
  )
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
  loading = 'lazy',
  decoding = 'async',
}: {
  photo: Blob
  url?: string
  alt?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
}): JSX.Element {
  const objectUrl = useObjectUrl(photo)
  if (!objectUrl) {
    return <></>
  }
  const image = (
    <Image
      src={objectUrl}
      alt={alt}
      fluid
      loading={loading}
      decoding={decoding}
    />
  )
  return url ? <ExternalLink href={url}>{image}</ExternalLink> : image
}

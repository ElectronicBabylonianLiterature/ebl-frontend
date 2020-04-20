import React, { useEffect, useState } from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from './ExternalLink'

export default function BlobImage({
  data,
  hasLink,
  alt,
}: {
  data: Blob
  hasLink?: boolean
  alt?: string
}): JSX.Element {
  const [objectUrl, setObjectUrl] = useState<string>()
  useEffect(() => {
    const url = URL.createObjectURL(data)
    setObjectUrl(url)
    return (): void => URL.revokeObjectURL(url)
  }, [data])

  const image = <Image src={objectUrl} alt={alt} fluid />
  return hasLink ? (
    <ExternalLink href={objectUrl}> {image} </ExternalLink>
  ) : (
    image
  )
}

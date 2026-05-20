import React from 'react'
import { Image } from 'react-bootstrap'
import { apiUrl } from 'http/ApiClient'

export default function ApiImage({
  fileName,
  className,
}: {
  fileName: string
  className?: string
}): JSX.Element {
  return (
    <Image
      src={apiUrl(`/images/${fileName}`)}
      alt={fileName}
      className={className}
      fluid
    />
  )
}

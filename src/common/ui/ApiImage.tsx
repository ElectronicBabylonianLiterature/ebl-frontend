import React from 'react'
import { Image } from 'react-bootstrap'
import { apiUrl } from 'http/ApiClient'

export default function ApiImage({
  fileName,
  className,
  loading = 'lazy',
  decoding = 'async',
}: {
  fileName: string
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
}): JSX.Element {
  return (
    <Image
      src={apiUrl(`/images/${fileName}`)}
      alt={fileName}
      className={className}
      fluid
      loading={loading}
      decoding={decoding}
    />
  )
}

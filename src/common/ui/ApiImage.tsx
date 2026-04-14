import React from 'react'
import { Image } from 'react-bootstrap'
import { apiUrl } from 'http/ApiClient'

export default function ApiImage({
  fileName,
}: {
  fileName: string
}): JSX.Element {
  return <Image src={apiUrl(`/images/${fileName}`)} alt={fileName} fluid />
}

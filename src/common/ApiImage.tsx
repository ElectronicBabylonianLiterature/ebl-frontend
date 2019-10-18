import React from 'react'
import { Image } from 'react-bootstrap'
import { apiUrl } from 'http/ApiClient'

export default function ApiImage({ fileName }) {
  return <Image src={apiUrl(`/images/${fileName}`)} alt={fileName} fluid />
}

import React from 'react'
import { Image } from 'react-bootstrap'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'
import { apiUrl } from 'http/ApiClient'

export default function ApiImage({ fileName }) {
  return <Image src={apiUrl(`/images/${fileName}`)} alt={fileName} fluid />
}

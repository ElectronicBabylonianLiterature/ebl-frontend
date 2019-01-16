import React from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ExternalLink'

export default function CdliImage ({ cdliNumber }) {
  const filename = `${cdliNumber}.jpg`
  const src = `https://cdli.ucla.edu/dl/photo/${filename}`

  return cdliNumber && (
    <ExternalLink href={src}>
      <Image src={src} alt={filename} responsive />
    </ExternalLink>
  )
}

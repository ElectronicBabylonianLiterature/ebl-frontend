import React from 'react'
import { Image } from 'react-bootstrap'

export default function CdliImage ({cdliNumber}) {
  const filename = `${cdliNumber}.jpg`
  const src = `https://cdli.ucla.edu/dl/photo/${filename}`

  return cdliNumber && (
    <Image src={src} alt={filename} responsive />
  )
}

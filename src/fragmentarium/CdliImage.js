import React from 'react'

export default function CdliImage ({cdliNumber}) {
  const filename = `${cdliNumber}.jpg`
  const src = `https://cdli.ucla.edu/dl/photo/${filename}`

  return cdliNumber && (
    <img width='20%' src={src} alt={filename} />
  )
}

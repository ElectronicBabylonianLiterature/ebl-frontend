import React from 'react'
import ExternalLink from 'common/ExternalLink'

export default function CdliLink({ cdliNumber, children }) {
  const cdliUrl = `https://cdli.ucla.edu/${encodeURIComponent(cdliNumber)}`
  return (
    <ExternalLink href={cdliUrl} aria-label={`CDLI text ${cdliNumber}`}>
      {children}
    </ExternalLink>
  )
}

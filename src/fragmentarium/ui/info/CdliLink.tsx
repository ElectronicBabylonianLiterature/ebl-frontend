import React from 'react'
import ExternalLink from 'common/ExternalLink'

interface Props {
  cdliNumber: string
  children: JSX.Element | string
}
export default function CdliLink({ cdliNumber, children }: Props): JSX.Element {
  const cdliUrl = `https://cdli.ucla.edu/${encodeURIComponent(cdliNumber)}`
  return (
    <ExternalLink href={cdliUrl} aria-label={`CDLI text ${cdliNumber}`}>
      {children}
    </ExternalLink>
  )
}

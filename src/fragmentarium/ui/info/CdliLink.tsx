import React, { ReactNode } from 'react'
import ExternalLink from 'common/ExternalLink'

interface Props {
  cdliNumber: string
  children: ReactNode
}
export default function CdliLink({ cdliNumber, children }: Props): JSX.Element {
  const cdliUrl = `https://cdli.earth/${encodeURIComponent(cdliNumber)}`
  return (
    <ExternalLink href={cdliUrl} aria-label={`CDLI text ${cdliNumber}`}>
      {children}
    </ExternalLink>
  )
}

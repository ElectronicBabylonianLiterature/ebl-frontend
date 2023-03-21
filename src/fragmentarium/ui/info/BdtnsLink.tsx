import React, { ReactNode } from 'react'
import ExternalLink from 'common/ExternalLink'

interface Props {
  bdtnsNumber: string
  children: ReactNode
}
export default function BdtnsLink({
  bdtnsNumber,
  children,
}: Props): JSX.Element {
  const bdtnsUrl = `http://bdtns.filol.csic.es/${encodeURIComponent(
    bdtnsNumber
  )}`
  return (
    <ExternalLink href={bdtnsUrl} aria-label={`BDTNS text ${bdtnsNumber}`}>
      {children}
    </ExternalLink>
  )
}

import React from 'react'
import ExternalLink from 'common/ExternalLink'

export default function LemmaQueryLink({
  lemmaId,
  children,
  anchor,
}: {
  lemmaId: string
  children?: React.ReactNode
  anchor?: string
}): JSX.Element {
  return (
    <ExternalLink
      href={`/library/search/?lemmas=${encodeURIComponent(lemmaId)}${
        anchor || ''
      }`}
      title={`View in fragmentarium search`}
    >
      {children}
      <i className={'pointer__hover my-2 fas fa-external-link-square-alt'} />
    </ExternalLink>
  )
}

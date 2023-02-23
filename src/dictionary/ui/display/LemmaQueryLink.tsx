import React from 'react'
import ExternalLink from 'common/ExternalLink'

export default function LemmaQueryLink({
  lemmaId,
  children,
}: {
  lemmaId: string
  children?: React.ReactNode
}): JSX.Element {
  return (
    <ExternalLink
      href={`/fragmentarium/search/?lemmas=${encodeURIComponent(lemmaId)}`}
      title={`View in fragmentarium search`}
    >
      {children}
      <i className={'pointer__hover my-2 fas fa-external-link-square-alt'} />
    </ExternalLink>
  )
}

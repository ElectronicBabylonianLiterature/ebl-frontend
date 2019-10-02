// @flow
import React from 'react'

import CdliLink from './CdliLink'
import ExternalLink from 'common/ExternalLink'
import cdliLogo from './cdli.png'
import { Fragment } from 'fragmentarium/fragment'

import './OrganizationLinks.css'

type Props = { +fragment: Fragment }

function MuseumLink({ fragment }: Props) {
  const museum = fragment.museum
  const link = museum.createLinkFor(fragment)
  return (
    <ExternalLink alt={museum.name} href={link.url} aria-label={link.label}>
      <img
        className="OrganizationLinks__image"
        src={museum.logo}
        alt={museum.name}
      />
    </ExternalLink>
  )
}

export default function OrganizationLinks({ fragment }: Props) {
  const cdliNumber = fragment.cdliNumber
  return (
    <p className="OrganizationLinks">
      {fragment.museum.hasFragmentLink && <MuseumLink fragment={fragment} />}
      {cdliNumber && (
        <CdliLink cdliNumber={cdliNumber}>
          <img className="OrganizationLinks__image" src={cdliLogo} alt="cdli" />
        </CdliLink>
      )}
    </p>
  )
}

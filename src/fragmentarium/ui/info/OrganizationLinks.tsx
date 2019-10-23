import React from 'react'

import CdliLink from './CdliLink'
import ExternalLink from 'common/ExternalLink'
import cdliLogo from './cdli.png'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLink } from 'fragmentarium/domain/museum'

import './OrganizationLinks.css'

function MuseumLink({ link }: { readonly link: FragmentLink }) {
  return (
    <ExternalLink alt={link.name} href={link.url} aria-label={link.label}>
      <img
        className="OrganizationLinks__image"
        src={link.logo}
        alt={link.name}
      />
    </ExternalLink>
  )
}

export default function OrganizationLinks({
  fragment
}: {
  readonly fragment: Fragment;
}) {
  const cdliNumber = fragment.cdliNumber
  return (
    <p className="OrganizationLinks">
      {fragment.hasLink && <MuseumLink link={fragment.getLink()} />}
      {cdliNumber && (
        <CdliLink cdliNumber={cdliNumber}>
          <img className="OrganizationLinks__image" src={cdliLogo} alt="cdli" />
        </CdliLink>
      )}
    </p>
  )
}

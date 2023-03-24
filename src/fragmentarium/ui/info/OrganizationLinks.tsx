import React from 'react'

import ExternalLink from 'common/ExternalLink'

import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLink } from 'fragmentarium/domain/museum'

import './OrganizationLinks.css'
import {
  BdtnsLogoLink,
  CdliLogoLink,
  ArchibabLogoLink,
  UrOnlineLogoLink,
} from './ExternalNumberLogoLink'

function MuseumLink({ link }: { readonly link: FragmentLink }): JSX.Element {
  return (
    <ExternalLink href={link.url} aria-label={link.label}>
      <img
        className="OrganizationLinks__image"
        src={link.logo}
        alt={link.name}
      />
    </ExternalLink>
  )
}

export default function OrganizationLinks({
  fragment,
}: {
  readonly fragment: Fragment
}): JSX.Element {
  const externalNumbers = [
    { number: 'cdliNumber', LogoLink: CdliLogoLink },
    { number: 'bdtnsNumber', LogoLink: BdtnsLogoLink },
    { number: 'archibabNumber', LogoLink: ArchibabLogoLink },
    { number: 'urOnlineNumber', LogoLink: UrOnlineLogoLink },
  ]
  return (
    <p className="OrganizationLinks">
      {fragment.hasLink && <MuseumLink link={fragment.getLink()} />}
      {externalNumbers.map(
        ({ number, LogoLink }) =>
          fragment[number] && <LogoLink number={fragment[number]} />
      )}
    </p>
  )
}

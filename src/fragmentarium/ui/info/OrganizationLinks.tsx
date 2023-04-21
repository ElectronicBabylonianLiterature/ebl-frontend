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
  hilprechtJenaLogoLink,
  hilprechtHeidelbergLogoLink,
} from './ExternalNumberLogoLink'

type LogoLinkComponent = ({ number }: { number: string }) => JSX.Element

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
  const externalNumbers: ReadonlyArray<[string, LogoLinkComponent]> = [
    [fragment.cdliNumber, CdliLogoLink],
    [fragment.bdtnsNumber, BdtnsLogoLink],
    [fragment.archibabNumber, ArchibabLogoLink],
    [fragment.urOnlineNumber, UrOnlineLogoLink],
    [fragment.hilprechtJenaNumber, hilprechtJenaLogoLink],
    [fragment.hilprechtHeidelbergNumber, hilprechtHeidelbergLogoLink],
  ]
  return (
    <p className="OrganizationLinks">
      {fragment.hasLink && <MuseumLink link={fragment.getLink()} />}
      {externalNumbers.map(
        ([number, LogoLink], index) =>
          number && <LogoLink number={number} key={index} />
      )}
    </p>
  )
}

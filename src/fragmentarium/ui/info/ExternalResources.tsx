import React from 'react'

import ExternalLink from 'common/ExternalLink'

import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLink } from 'fragmentarium/domain/museum'

import './ExternalResources.css'
import {
  BdtnsLogoLink,
  CdliLogoLink,
  ArchibabLogoLink,
  UrOnlineLogoLink,
  HilprechtJenaLogoLink,
  HilprechtHeidelbergLogoLink,
} from './ExternalNumberLogoLink'

type LogoLinkComponent = ({ number }: { number: string }) => JSX.Element

function MuseumLink({ link }: { readonly link: FragmentLink }): JSX.Element {
  return (
    <ExternalLink href={link.url} aria-label={link.label}>
      <img
        className="ExternalResources__image"
        src={link.logo}
        alt={link.name}
      />
    </ExternalLink>
  )
}

export default function ExternalResources({
  fragment,
}: {
  readonly fragment: Fragment
}): JSX.Element {
  const externalNumbers: ReadonlyArray<[string, LogoLinkComponent]> = [
    [fragment.cdliNumber, CdliLogoLink],
    [fragment.bdtnsNumber, BdtnsLogoLink],
    [fragment.archibabNumber, ArchibabLogoLink],
    [fragment.urOnlineNumber, UrOnlineLogoLink],
    [fragment.hilprechtJenaNumber, HilprechtJenaLogoLink],
    [fragment.hilprechtHeidelbergNumber, HilprechtHeidelbergLogoLink],
  ]
  return (
    <p className="ExternalResources">
      {fragment.hasLink && <MuseumLink link={fragment.getLink()} />}
      {externalNumbers.map(
        ([number, LogoLink], index) =>
          number && <LogoLink number={number} key={index} />
      )}
    </p>
  )
}

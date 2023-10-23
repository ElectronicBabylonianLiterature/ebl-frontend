import React from 'react'

import ExternalLink from 'common/ExternalLink'

import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLink } from 'fragmentarium/domain/museum'

import './ExternalResources.sass'
import {
  BdtnsLink,
  CdliLink,
  ArchibabLink,
  UrOnlineLink,
  HilprechtJenaLink,
  HilprechtHeidelbergLink,
} from './ExternalNumberLink'

type ExternalLinkComponent = ({ number }: { number: string }) => JSX.Element

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
  const externalNumbers: ReadonlyArray<[string, ExternalLinkComponent]> = [
    [fragment.cdliNumber, CdliLink],
    [fragment.bdtnsNumber, BdtnsLink],
    [fragment.archibabNumber, ArchibabLink],
    [fragment.urOnlineNumber, UrOnlineLink],
    [fragment.hilprechtJenaNumber, HilprechtJenaLink],
    [fragment.hilprechtHeidelbergNumber, HilprechtHeidelbergLink],
  ]
  return (
    <ul className="ExternalResources__items">
      {fragment.hasLink && <MuseumLink link={fragment.getLink()} />}
      {externalNumbers.map(
        ([number, LinkComponent], index) =>
          number && (
            <li>
              <LinkComponent number={number} key={index} />
            </li>
          )
      )}
    </ul>
  )
}

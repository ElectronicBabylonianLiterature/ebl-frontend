import React from 'react'

import CdliLink from './CdliLink'
import ExternalLink from 'common/ExternalLink'
import cdliLogo from './cdli.png'
import bdtnsLogo from './bdtns.png'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLink } from 'fragmentarium/domain/museum'

import './OrganizationLinks.css'
import BdtnsLink from './BdtnsLink'

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
  const cdliNumber = fragment.cdliNumber
  const bdtnsNumber = fragment.bdtnsNumber

  return (
    <p className="OrganizationLinks">
      {fragment.hasLink && <MuseumLink link={fragment.getLink()} />}
      {cdliNumber && (
        <CdliLink cdliNumber={cdliNumber}>
          <img className="OrganizationLinks__image" src={cdliLogo} alt="cdli" />
        </CdliLink>
      )}
      {bdtnsNumber && (
        <BdtnsLink bdtnsNumber={bdtnsNumber}>
          <img
            className="OrganizationLinks__image"
            src={bdtnsLogo}
            alt="bdtns"
          />
        </BdtnsLink>
      )}
    </p>
  )
}

import React from 'react'

import ExternalLink from 'common/ExternalLink'
import cdliLogo from './cdli.png'
import bdtnsLogo from './bdtns.png'
import archibabLogo from './archibab.jpeg'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLink } from 'fragmentarium/domain/museum'

import './OrganizationLinks.css'
import ExternalNumberLogoLink from './ExternalNumberLogoLink'

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
  const archibabNumber = fragment.archibabNumber

  return (
    <p className="OrganizationLinks">
      {fragment.hasLink && <MuseumLink link={fragment.getLink()} />}
      {cdliNumber && (
        <ExternalNumberLogoLink
          externalNumber={cdliNumber}
          baseUrl={'https://cdli.mpiwg-berlin.mpg.de/'}
          label={'CDLI'}
          logo={cdliLogo}
        />
      )}
      {bdtnsNumber && (
        <ExternalNumberLogoLink
          externalNumber={bdtnsNumber}
          baseUrl={'http://bdtns.filol.csic.es/'}
          label={'BDTNS'}
          logo={bdtnsLogo}
        />
      )}
      {archibabNumber && (
        <ExternalNumberLogoLink
          externalNumber={archibabNumber}
          baseUrl={'http://www.archibab.fr/'}
          label={'ARCHIBAB'}
          logo={archibabLogo}
        />
      )}
    </p>
  )
}

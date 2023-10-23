import ExternalLink from 'common/ExternalLink'
import cdliLogo from './logos/cdli.png'
import bdtnsLogo from './logos/bdtns.png'
import archibabLogo from './logos/archibab.jpeg'
import urOnlineLogo from './logos/ur-online.jpeg'
import hilprechtJenaLogo from './logos/hilprecht-jena.png'
import hilprechtHeidelbergLogo from './logos/hilprecht-heidelberg.png'
import React from 'react'

interface Props {
  externalNumber: string
  baseUrl: string
  label: string
  logo: string
}
function ExternalNumberLogoLink({
  baseUrl,
  externalNumber,
  label,
  logo,
}: Props): JSX.Element {
  const cdliUrl = `${baseUrl}${encodeURIComponent(externalNumber)}`
  return (
    <ExternalLink href={cdliUrl} aria-label={`${label} text ${externalNumber}`}>
      <img className="ExternalResources__image" src={logo} alt={label} />
    </ExternalLink>
  )
}

export function CdliLogoLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLogoLink
      externalNumber={number}
      baseUrl={'https://cdli.mpiwg-berlin.mpg.de/'}
      label={'CDLI'}
      logo={cdliLogo}
    />
  )
}
export function BdtnsLogoLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLogoLink
      externalNumber={number}
      baseUrl={'http://bdtns.filol.csic.es/'}
      label={'BDTNS'}
      logo={bdtnsLogo}
    />
  )
}
export function ArchibabLogoLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLogoLink
      externalNumber={number}
      baseUrl={'http://www.archibab.fr/'}
      label={'Archibab'}
      logo={archibabLogo}
    />
  )
}
export function UrOnlineLogoLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLogoLink
      externalNumber={number}
      baseUrl={'http://www.ur-online.org/subject/'}
      label={'Ur Online'}
      logo={urOnlineLogo}
    />
  )
}
export function HilprechtJenaLogoLink({
  number,
}: {
  number: string
}): JSX.Element {
  return (
    <ExternalNumberLogoLink
      externalNumber={number}
      baseUrl={'https://hilprecht.mpiwg-berlin.mpg.de/object3d/'}
      label={'Hilprecht Collection'}
      logo={hilprechtJenaLogo}
    />
  )
}
export function HilprechtHeidelbergLogoLink({
  number,
}: {
  number: string
}): JSX.Element {
  return (
    <ExternalNumberLogoLink
      externalNumber={number}
      baseUrl={'https://doi.org/10.11588/heidicon/'}
      label={'Hilprecht Collection – HeiCuBeDa'}
      logo={hilprechtHeidelbergLogo}
    />
  )
}

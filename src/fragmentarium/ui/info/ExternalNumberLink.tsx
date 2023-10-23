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
function ExternalNumberLink({
  baseUrl,
  externalNumber,
  label,
  logo,
}: Props): JSX.Element {
  const url = `${baseUrl}${encodeURIComponent(externalNumber)}`
  return (
    <ExternalLink href={url} aria-label={`${label} text ${externalNumber}`}>
      <img className="ExternalResources__image" src={logo} alt={label} />
    </ExternalLink>
  )
}

export function CdliLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'https://cdli.mpiwg-berlin.mpg.de/'}
      label={'CDLI'}
      logo={cdliLogo}
    />
  )
}
export function BdtnsLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'http://bdtns.filol.csic.es/'}
      label={'BDTNS'}
      logo={bdtnsLogo}
    />
  )
}
export function ArchibabLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'http://www.archibab.fr/'}
      label={'Archibab'}
      logo={archibabLogo}
    />
  )
}
export function UrOnlineLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'http://www.ur-online.org/subject/'}
      label={'Ur Online'}
      logo={urOnlineLogo}
    />
  )
}
export function HilprechtJenaLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'https://hilprecht.mpiwg-berlin.mpg.de/object3d/'}
      label={'Hilprecht Collection'}
      logo={hilprechtJenaLogo}
    />
  )
}
export function HilprechtHeidelbergLink({
  number,
}: {
  number: string
}): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'https://doi.org/10.11588/heidicon/'}
      label={'Hilprecht Collection – HeiCuBeDa'}
      logo={hilprechtHeidelbergLogo}
    />
  )
}

import ExternalLink from 'common/ExternalLink'
import React from 'react'

interface Props {
  externalNumber: string
  baseUrl: string
  label: string
}
function ExternalNumberLink({
  baseUrl,
  externalNumber,
  label,
}: Props): JSX.Element {
  const url = `${baseUrl}${encodeURIComponent(externalNumber)}`
  return (
    <ExternalLink href={url} aria-label={`${label} text ${externalNumber}`}>
      {`${label} (${externalNumber})`}
    </ExternalLink>
  )
}

export function CdliLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'https://cdli.mpiwg-berlin.mpg.de/'}
      label={'CDLI'}
    />
  )
}
export function BdtnsLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'http://bdtns.filol.csic.es/'}
      label={'BDTNS'}
    />
  )
}
export function ArchibabLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'http://www.archibab.fr/'}
      label={'Archibab'}
    />
  )
}
export function UrOnlineLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'http://www.ur-online.org/subject/'}
      label={'Ur Online'}
    />
  )
}
export function HilprechtJenaLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      externalNumber={number}
      baseUrl={'https://hilprecht.mpiwg-berlin.mpg.de/object3d/'}
      label={'Hilprecht Collection'}
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
    />
  )
}

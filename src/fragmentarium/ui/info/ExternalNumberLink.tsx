import ExternalLink from 'common/ExternalLink'
import React from 'react'

interface Props {
  number: string
  baseUrl?: string
  label: string
}
function ExternalNumberLink({ baseUrl, number, label }: Props): JSX.Element {
  const url = `${baseUrl}${encodeURIComponent(number)}`
  return (
    <ExternalLink href={url} aria-label={`${label} text ${number}`}>
      {`${label} (${number})`}
    </ExternalLink>
  )
}

export function BmIdLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'https://www.britishmuseum.org/collection/object/'}
      label={'The British Museum'}
    />
  )
}
export function CdliLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'https://cdli.mpiwg-berlin.mpg.de/'}
      label={'CDLI'}
    />
  )
}
export function BdtnsLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'http://bdtns.filol.csic.es/'}
      label={'BDTNS'}
    />
  )
}
export function ArchibabLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'http://www.archibab.fr/'}
      label={'Archibab'}
    />
  )
}
export function UrOnlineLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'http://www.ur-online.org/subject/'}
      label={'Ur Online'}
    />
  )
}
export function HilprechtJenaLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
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
      number={number}
      baseUrl={'https://doi.org/10.11588/heidicon/'}
      label={'Hilprecht Collection – HeiCuBeDa'}
    />
  )
}
export function YaleBabylonianLink({
  number,
}: {
  number: string
}): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'https://collections.peabody.yale.edu/search/Record/YPM-'}
      label={'Yale Babylonian Collection, Peabody Museum'}
    />
  )
}

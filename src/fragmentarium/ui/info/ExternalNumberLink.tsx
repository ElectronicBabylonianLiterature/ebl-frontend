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
    <>
      {`${label} (`}
      <ExternalLink href={url} aria-label={`${label} text ${number}`}>
        {number}
      </ExternalLink>
      {')'}
    </>
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
export function YalePeabodyLink({ number }: { number: string }): JSX.Element {
  const formattedNumber = number.replace(/^BC\./g, 'BC-')
  return (
    <ExternalNumberLink
      number={formattedNumber}
      baseUrl={'https://collections.peabody.yale.edu/search/Record/YPM-'}
      label={'Yale Babylonian Collection'}
    />
  )
}
export function AchemenetLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={
        'http://www.achemenet.com/en/item/?/textual-sources/texts-by-languages-and-scripts/babylonian/'
      }
      label={'Achemenet'}
    />
  )
}
export function NabuccoLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'https://nabucco.acdh.oeaw.ac.at/archiv/tablet/detail/'}
      label={'NaBuCCo'}
export function MetropolitanLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'https://www.metmuseum.org/art/collection/search/'}
      label={'The Metropolitan Museum of Art'}
    />
  )
}
export function LouvreLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'https://collections.louvre.fr/ark:/53355/'}
      label={'Louvre'}
    />
  )
}
export function PhiladelphiaLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={'https://www.penn.museum/collections/object/'}
      label={'Penn Museum'}
    />
  )
}
export function AchemenetLink({ number }: { number: string }): JSX.Element {
  return (
    <ExternalNumberLink
      number={number}
      baseUrl={
        'http://www.achemenet.com/en/item/?/textual-sources/texts-by-languages-and-scripts/babylonian/'
      }
      label={'Achemenet'}
    />
  )
}

function OraccLink({
  project,
  cdliNumber,
}: {
  project: string
  cdliNumber: string
}): JSX.Element {
  const baseUrl =
    project === 'ccp'
      ? 'https://ccp.yale.edu/'
      : `http://oracc.museum.upenn.edu/${project}/`
  return (
    <ExternalLink
      href={`${baseUrl}${encodeURIComponent(cdliNumber)}`}
      aria-label={`Oracc text ${project} ${cdliNumber}`}
    >
      {project.toUpperCase()}
    </ExternalLink>
  )
}

export function OraccLinks({
  projects,
  cdliNumber,
}: {
  projects: readonly string[]
  cdliNumber: string
}): JSX.Element {
  return (
    <>
      {'Oracc ('}
      {projects.map((project, index) => (
        <>
          {index !== 0 && ', '}
          <OraccLink project={project} cdliNumber={cdliNumber} key={index} />
        </>
      ))}
      {')'}
    </>
  )
}

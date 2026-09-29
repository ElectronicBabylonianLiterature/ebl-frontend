import React, { Fragment } from 'react'
import ExternalLink from 'common/ui/ExternalLink'

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
function SealLink({ sealTextNumber }: { sealTextNumber: string }): JSX.Element {
  const url = `https://seal.huji.ac.il/node/${encodeURIComponent(
    sealTextNumber,
  )}`
  return (
    <ExternalLink href={url} aria-label={`Seal text ${sealTextNumber}`}>
      {sealTextNumber}
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
        <Fragment key={index}>
          {index !== 0 && ', '}
          <OraccLink project={project} cdliNumber={cdliNumber} />
        </Fragment>
      ))}
      {')'}
    </>
  )
}

export function SealLinks({
  sealTextNumbers,
}: {
  sealTextNumbers: readonly string[]
}): JSX.Element {
  return (
    <>
      {'SEAL ('}
      {sealTextNumbers.map((sealTextNumber, index) => (
        <Fragment key={index}>
          {index !== 0 && ', '}
          <SealLink sealTextNumber={sealTextNumber} />
        </Fragment>
      ))}
      {')'}
    </>
  )
}

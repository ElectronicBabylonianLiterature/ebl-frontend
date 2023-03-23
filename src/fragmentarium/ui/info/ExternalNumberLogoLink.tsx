import ExternalLink from 'common/ExternalLink'
import React from 'react'

interface Props {
  externalNumber: string
  baseUrl: string
  label: string
  logo: string
}
export default function ExternalNumberLogoLink({
  baseUrl,
  externalNumber,
  label,
  logo,
}: Props): JSX.Element {
  const cdliUrl = `${baseUrl}${encodeURIComponent(externalNumber)}`
  return (
    <ExternalLink href={cdliUrl} aria-label={`${label} text ${externalNumber}`}>
      <img className="OrganizationLinks__image" src={logo} alt={label} />
    </ExternalLink>
  )
}

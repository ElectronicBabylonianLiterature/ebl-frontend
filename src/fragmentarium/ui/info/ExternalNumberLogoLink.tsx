import React, { DetailedHTMLProps, ReactNode } from 'react'

function ExternalLink({
  children,
  ...props
}: { children: ReactNode } & DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>): JSX.Element {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

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

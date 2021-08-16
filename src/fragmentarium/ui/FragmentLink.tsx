import React, { ReactNode, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { stringify } from 'query-string'
import Folio from 'fragmentarium/domain/Folio'

export function createFragmentUrl(number: string): string {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  return `/fragmentarium/${encodeURIComponent(encodeURIComponent(number))}`
}

export function createFragmentUrlWithFolio(
  number: string,
  folio: Folio,
  createUrl: (number: string) => string = createFragmentUrl
): string {
  const query = stringify(
    { tab: 'folio', folioName: folio.name, folioNumber: folio.number },
    { strict: false }
  )
  return `${createUrl(number)}?${query}`
}

export function createFragmentUrlWithTab(
  number: string,
  tab: string,
  createUrl: (number: string) => string = createFragmentUrl
): string {
  const query = stringify({ tab }, { strict: false })
  return `${createUrl(number)}?${query}`
}

export default function FragmentLink({
  createUrl,
  number,
  children,
  folio,
  ...props
}: PropsWithChildren<{
  createUrl: (number: string) => string
  number: string
  children: ReactNode
  folio: Folio | null
}>): JSX.Element {
  const link = folio
    ? createFragmentUrlWithFolio(number, folio, createUrl)
    : createUrl(number)
  return (
    <Link to={link} {...props}>
      {children}
    </Link>
  )
}

FragmentLink.defaultProps = { createUrl: createFragmentUrl, folio: null }

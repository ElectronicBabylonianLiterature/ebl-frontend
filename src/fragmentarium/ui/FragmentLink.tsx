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
  folio: Folio
): string {
  const query = stringify(
    { tab: 'folio', folioName: folio.name, folioNumber: folio.number },
    { strict: false }
  )
  return `${createFragmentUrl(number)}?${query}`
}

export function createFragmentUrlWithTab(number: string, tab: string): string {
  const query = stringify({ tab }, { strict: false })
  return `${createFragmentUrl(number)}?${query}`
}

export default function FragmentLink({
  number,
  children,
  folio,
  suffix = '',
  ...props
}: PropsWithChildren<{
  number: string
  children: ReactNode
  folio: Folio | null
  suffix?: string
}>): JSX.Element {
  const link = folio
    ? createFragmentUrlWithFolio(number, folio)
    : createFragmentUrl(number)
  return (
    <Link to={link + suffix} {...props}>
      {children}
    </Link>
  )
}
FragmentLink.defaultProps = { folio: null }

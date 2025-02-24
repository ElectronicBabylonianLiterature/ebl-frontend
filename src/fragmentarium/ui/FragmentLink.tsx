import React, { ReactNode, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { stringify } from 'query-string'
import Folio from 'fragmentarium/domain/Folio'

export function createFragmentUrl(number: string, hash = ''): string {
  return `/library/${encodeURIComponent(number)}${
    hash && '#'
  }${encodeURIComponent(hash)}`
}

export function createFragmentUrlWithFolio(
  number: string,
  folio: Folio,
  hash = ''
): string {
  const query = stringify(
    { tab: 'folio', folioName: folio.name, folioNumber: folio.number },
    { strict: false }
  )
  return `${createFragmentUrl(number, hash)}?${query}`
}

export function createFragmentUrlWithTab(
  number: string,
  tab: string,
  hash = ''
): string {
  const query = stringify({ tab }, { strict: false })
  return `${createFragmentUrl(number, hash)}?${query}`
}

export default function FragmentLink({
  number,
  children,
  folio = null,
  hash = '',
  ...props
}: PropsWithChildren<{
  number: string
  children: ReactNode
  folio?: Folio | null
  hash?: string
}>): JSX.Element {
  const link = folio
    ? createFragmentUrlWithFolio(number, folio, hash)
    : createFragmentUrl(number, hash)
  return (
    <Link to={link} {...props}>
      {children}
    </Link>
  )
}

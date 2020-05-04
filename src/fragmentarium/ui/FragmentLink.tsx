import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { stringify } from 'query-string'
import Folio from 'fragmentarium/domain/Folio'

export function createFragmentUrl(number) {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  return `/fragmentarium/${encodeURIComponent(encodeURIComponent(number))}`
}

export function createFragmentUrlWithFolio(number, folio) {
  const query = stringify(
    { tab: 'folio', folioName: folio.name, folioNumber: folio.number },
    { strict: false }
  )
  return `${createFragmentUrl(number)}?${query}`
}

export function createFragmentUrlWithTab(number, tab) {
  const query = stringify({ tab }, { strict: false })
  return `${createFragmentUrl(number)}?${query}`
}

export default function FragmentLink({
  number,
  children,
  folio,
  ...props
}: {
  number: string
  children: ReactNode
  folio: Folio | null
}) {
  const link = folio
    ? createFragmentUrlWithFolio(number, folio)
    : createFragmentUrl(number)
  return (
    <Link to={link} {...props}>
      {children}
    </Link>
  )
}
FragmentLink.defaultProps = { folio: null }

import React from 'react'
import { Link } from 'react-router-dom'
import queryString from 'query-string'

export function createFragmentUrl(number) {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  return `/fragmentarium/${encodeURIComponent(encodeURIComponent(number))}`
}

export function createFragmentUrlWithFolio(number, folio) {
  const query = queryString.stringify(
    { tab: 'folio', folioName: folio.name, folioNumber: folio.number },
    { strict: false }
  )
  return `${createFragmentUrl(number)}?${query}`
}

export function createFragmentUrlWithTab(number, tab) {
  const query = queryString.stringify({ tab }, { strict: false })
  return `${createFragmentUrl(number)}?${query}`
}

export default function FragmentLink({ number, children, folio, ...props }) {
  const link = folio
    ? createFragmentUrlWithFolio(number, folio)
    : createFragmentUrl(number)
  return (
    <Link to={link} {...props}>
      {children}
    </Link>
  )
}

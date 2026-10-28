import React, { ReactNode, PropsWithChildren, useContext } from 'react'
import { Link } from 'react-router-dom'
import { stringify } from 'common/utils/queryString'
import Folio from 'fragmentarium/domain/Folio'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { CANONICAL_ORIGIN } from 'router/domain'

function encodeWellFormedURIComponent(value: string): string {
  const wellFormedValue = Array.from(value, (character) => {
    const codePoint = character.charCodeAt(0)
    return character.length === 1 && codePoint >= 0xd800 && codePoint <= 0xdfff
      ? '\uFFFD'
      : character
  }).join('')
  return encodeURIComponent(wellFormedValue)
}

export function encodeFragmentNumber(number: string): string {
  return encodeWellFormedURIComponent(number)
}

function createFragmentLocation(
  number: string,
  hash: string,
  query = '',
): string {
  return `/library/${encodeFragmentNumber(number)}${query && '?'}${query}${
    hash && '#'
  }${encodeWellFormedURIComponent(hash)}`
}

export function createFragmentUrl(number: string, hash = ''): string {
  return createFragmentLocation(number, hash)
}

export function createFragmentCanonicalUrl(number: string): string {
  return `${CANONICAL_ORIGIN}${createFragmentUrl(number)}`
}

export function createFragmentUrlWithFolio(
  number: string,
  folio: Folio,
  hash = '',
): string {
  const query = stringify(
    { tab: 'folio', folioName: folio.name, folioNumber: folio.number },
    { strict: false },
  )
  return createFragmentLocation(number, hash, query)
}

export function createFragmentUrlWithTab(
  number: string,
  tab: string,
  hash = '',
): string {
  const query = stringify({ tab }, { strict: false })
  return createFragmentLocation(number, hash, query)
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
  const useRouterLinks = useContext(RouterLinkModeContext)
  const link = folio
    ? createFragmentUrlWithFolio(number, folio, hash)
    : createFragmentUrl(number, hash)
  return (
    <>
      {useRouterLinks ? (
        <Link to={link} {...props}>
          {children}
        </Link>
      ) : (
        <a href={link} {...props}>
          {children}
        </a>
      )}
    </>
  )
}

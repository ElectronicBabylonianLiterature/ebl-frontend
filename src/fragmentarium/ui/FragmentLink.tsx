import React, { ReactNode, PropsWithChildren, useContext } from 'react'
import { Link } from 'react-router-dom'
import { stringify } from 'query-string'
import Folio from 'fragmentarium/domain/Folio'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { CANONICAL_ORIGIN } from 'router/domain'

function toWellFormed(value: string): string {
  let result = ''

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    const next = value.charCodeAt(index + 1)

    if (code >= 0xd800 && code <= 0xdbff) {
      if (next >= 0xdc00 && next <= 0xdfff) {
        result += value[index] + value[index + 1]
        index += 1
      } else {
        result += '\uFFFD'
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      result += '\uFFFD'
    } else {
      result += value[index]
    }
  }

  return result
}

export function encodeFragmentNumber(number: string): string {
  try {
    return encodeURIComponent(number)
  } catch {
    return encodeURIComponent(toWellFormed(number))
  }
}

export function createFragmentUrl(number: string, hash = ''): string {
  return `/library/${encodeFragmentNumber(number)}${
    hash && '#'
  }${encodeURIComponent(hash)}`
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
  return `${createFragmentUrl(number, hash)}?${query}`
}

export function createFragmentUrlWithTab(
  number: string,
  tab: string,
  hash = '',
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

import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Token } from 'transliteration/domain/token'
import { getTokenRealiaIds } from 'fragmentarium/domain/realiaAnnotations'
import RealiaAnnotationsContext from 'transliteration/ui/RealiaAnnotationsContext'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { getRealiaPageUrl } from 'realia/ui/realiaPage'
import './RealiaTokenLinks.sass'

export default function RealiaTokenLinks({
  token,
}: {
  token: Token
}): JSX.Element | null {
  const lookup = useContext(RealiaAnnotationsContext)
  const useRouterLinks = useContext(RouterLinkModeContext)
  const realiaIds = getTokenRealiaIds(lookup, token)

  if (realiaIds.length === 0 || !useRouterLinks) {
    return null
  }

  return (
    <sup className={'realia-token-links'}>
      {realiaIds.map((realiaId) => (
        <Link
          key={realiaId}
          to={getRealiaPageUrl(realiaId)}
          title={`Dictionary of Realia: ${realiaId}`}
          aria-label={`realia-link-${realiaId}`}
        >
          RlA
        </Link>
      ))}
    </sup>
  )
}

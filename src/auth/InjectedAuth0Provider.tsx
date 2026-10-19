import React, { PropsWithChildren, useCallback, useMemo } from 'react'
import { useHistory } from 'router/compat'
import createAuth0Config from 'auth/createAuth0Config'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { scopeString } from 'auth/Auth'
import { RedirectAppState } from 'auth/Auth0AuthenticationService'

const redirectUriKey = 'redirect_uri'

export default function InjectedAuth0Provider({
  children,
}: PropsWithChildren<unknown>): JSX.Element {
  const auth0Config = useMemo(() => createAuth0Config(), [])
  const history = useHistory()
  const authorizationParams = useMemo(
    () => ({
      [redirectUriKey]: window.location.origin,
      scope: scopeString,
      audience: auth0Config.audience,
    }),
    [auth0Config.audience],
  )
  const onRedirectCallback = useCallback(
    (appState?: RedirectAppState): void => {
      const targetUrl = appState?.targetUrl
      history.push(targetUrl ? targetUrl : window.location.pathname)
    },
    [history],
  )
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientID}
      authorizationParams={authorizationParams}
      onRedirectCallback={onRedirectCallback}
      returnTo={window.location.origin}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useCookiesForTransactions={true}
    >
      {children}
    </Auth0Provider>
  )
}

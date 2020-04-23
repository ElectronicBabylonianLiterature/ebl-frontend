import React, { useState, useEffect, PropsWithChildren } from 'react'
import createAuth0Client, {
  Auth0Client,
  Auth0ClientOptions,
} from '@auth0/auth0-spa-js'
import decode from 'jwt-decode'
import MemorySession, { Session } from 'auth/Session'
import Spinner from 'common/Spinner'
import { AuthenticationContext, AuthenticationService } from 'auth/Auth'
import Auth0AuthenticationService from 'auth/Auth0AuthenticationService'

async function createSession(auth0Client: Auth0Client): Promise<Session> {
  const accessToken = await auth0Client.getTokenSilently()
  return new MemorySession(
    decode<{ scope: string }>(accessToken).scope.split(' ')
  )
}

const DEFAULT_REDIRECT_CALLBACK = (state: unknown): void =>
  window.history.replaceState({}, document.title, window.location.pathname)

function isRedirect(): boolean {
  return (
    window.location.search.includes('code=') &&
    window.location.search.includes('state=')
  )
}

async function createAuthenticationService(
  auth0Client: Auth0Client,
  returnTo: string
): Promise<AuthenticationService> {
  const isAuthenticated = await auth0Client.isAuthenticated()
  if (isAuthenticated) {
    const user = await auth0Client.getUser()
    const session = await createSession(auth0Client)
    return new Auth0AuthenticationService(
      auth0Client,
      returnTo,
      true,
      user,
      session
    )
  } else {
    return new Auth0AuthenticationService(auth0Client, returnTo)
  }
}

export const Auth0Provider = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  returnTo,
  ...initOptions
}: PropsWithChildren<Auth0ClientOptions>): JSX.Element => {
  const [autheticationService, setAuthenticationService] = useState<
    AuthenticationService
  >()

  useEffect(() => {
    const initAuth0 = async (): Promise<void> => {
      const auth0Client = await createAuth0Client(initOptions)

      if (isRedirect()) {
        const { appState } = await auth0Client.handleRedirectCallback()
        onRedirectCallback(appState)
      }

      const authenticationService = await createAuthenticationService(
        auth0Client,
        returnTo
      )
      setAuthenticationService(authenticationService)
    }
    initAuth0()
    // eslint-disable-next-line
  }, [])

  return autheticationService ? (
    <AuthenticationContext.Provider value={autheticationService}>
      {children}
    </AuthenticationContext.Provider>
  ) : (
    <Spinner>Authenticating...</Spinner>
  )
}

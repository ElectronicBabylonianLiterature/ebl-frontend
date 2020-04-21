import React, {
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from 'react'
import createAuth0Client, {
  Auth0Client,
  Auth0ClientOptions,
} from '@auth0/auth0-spa-js'
import decode from 'jwt-decode'
import _ from 'lodash'
import { Session } from 'auth/Session'
import applicationScopes from 'auth/applicationScopes.json'
import { AuthenticationService } from 'auth/Auth'
import Spinner from 'common/Spinner'

class Auth0Session implements Session {
  readonly scopes: readonly string[]

  static async create(auth0Client: Auth0Client): Promise<Auth0Session> {
    const accessToken = await auth0Client.getTokenSilently()
    return new Auth0Session(decode(accessToken).scope.split(' '))
  }

  constructor(scopes: readonly string[]) {
    this.scopes = scopes
  }

  hasScope(scope: string): boolean {
    return this.scopes.includes(scope)
  }

  isAllowedToReadWords(): boolean {
    return this.hasApplicationScope('readWords')
  }

  isAllowedToWriteWords(): boolean {
    return this.hasApplicationScope('writeWords')
  }

  isAllowedToReadFragments(): boolean {
    return this.hasApplicationScope('readFragments')
  }

  isAllowedToTransliterateFragments(): boolean {
    return this.hasApplicationScope('transliterateFragments')
  }

  isAllowedToLemmatizeFragments(): boolean {
    return this.hasApplicationScope('lemmatizeFragments')
  }

  isAllowedToAnnotateFragments(): boolean {
    return this.hasApplicationScope('annotateFragments')
  }

  isAllowedToReadBibliography(): boolean {
    return this.hasApplicationScope('readBibliography')
  }

  isAllowedToWriteBibliography(): boolean {
    return this.hasApplicationScope('writeBibliography')
  }

  isAllowedToWriteTexts(): boolean {
    return this.hasApplicationScope('writeTexts')
  }

  hasBetaAccess(): boolean {
    return this.hasApplicationScope('accessBeta')
  }

  private hasApplicationScope(applicationScope: string): boolean {
    const scope = applicationScopes[applicationScope]
    return this.hasScope(scope)
  }
}

const DEFAULT_REDIRECT_CALLBACK = (state: unknown): void =>
  window.history.replaceState({}, document.title, window.location.pathname)

export const Auth0Context = React.createContext<AuthenticationService>({
  login: _.noop,
  logout: _.noop,
  getSession() {
    return new Auth0Session([])
  },
  isAuthenticated() {
    return false
  },
  getAccessToken() {
    throw new Error('Not authenticated')
  },
  getUser() {
    throw new Error('Not authenticated')
  },
})

export const useAuth0 = (): AuthenticationService => useContext(Auth0Context)

export const Auth0Provider = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  returnTo,
  ...initOptions
}: PropsWithChildren<Auth0ClientOptions>): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState()
  const [auth0Client, setAuth0] = useState<Auth0Client>()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session>(new Auth0Session([]))

  useEffect(() => {
    const initAuth0 = async (): Promise<void> => {
      const auth0FromHook = await createAuth0Client(initOptions)
      setAuth0(auth0FromHook)

      if (
        window.location.search.includes('code=') &&
        window.location.search.includes('state=')
      ) {
        const { appState } = await auth0FromHook.handleRedirectCallback()
        onRedirectCallback(appState)
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated()
      setIsAuthenticated(isAuthenticated)

      if (isAuthenticated) {
        const user = await auth0FromHook.getUser()
        setUser(user)
        setSession(await Auth0Session.create(auth0FromHook))
      }

      setLoading(false)
    }
    initAuth0()
    // eslint-disable-next-line
  }, [])

  return (
    <Auth0Context.Provider
      value={{
        login(): void {
          auth0Client!.loginWithRedirect({
            appState: { targetUrl: window.location.pathname },
          })
        },
        logout(): void {
          auth0Client!.logout({
            returnTo: returnTo,
          })
        },
        getSession(): Session {
          return session
        },
        isAuthenticated(): boolean {
          return isAuthenticated
        },
        getAccessToken(): Promise<string> {
          return auth0Client!.getTokenSilently()
        },
        getUser(): any {
          return user
        },
      }}
    >
      {loading ? <Spinner>Authenticating...</Spinner> : children}
    </Auth0Context.Provider>
  )
}

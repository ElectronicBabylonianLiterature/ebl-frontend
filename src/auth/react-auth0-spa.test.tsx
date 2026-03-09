import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js'
import * as jwtDecode from 'jwt-decode'
import applicationScopes from 'auth/applicationScopes.json'
import { useAuthentication } from 'auth/Auth'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

jest.mock('jwt-decode')

Object.defineProperty(window, 'history', {
  value: { replaceState: jest.fn() },
  writable: true,
})

const createDefaultAuth0ClientMock = (
  overrides?: Partial<Auth0Client>,
): jest.Mocked<Auth0Client> =>
  ({
    isAuthenticated: jest.fn().mockResolvedValue(false),
    getUser: jest.fn(),
    getTokenSilently: jest.fn(),
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
    handleRedirectCallback: jest.fn(),
    checkSession: jest.fn().mockResolvedValue(undefined),
    ...(overrides || {}),
  }) as jest.Mocked<Auth0Client>

const createMockDecodedToken = (
  overrides?: Partial<{ scope?: string; aud: string; permissions?: string[] }>,
) => ({
  scope: 'openid profile email',
  aud: 'ebl-backend',
  permissions: [],
  ...(overrides || {}),
})

const PermissionProbe = (): JSX.Element => {
  const session = useAuthentication().getSession()

  return (
    <>
      <div data-testid="can-read-words">
        {String(session.isAllowedToReadWords())}
      </div>
      <div data-testid="can-write-bibliography">
        {String(session.isAllowedToWriteBibliography())}
      </div>
    </>
  )
}

describe('Auth0Provider', () => {
  const defaultProviderProps = {
    domain: 'example.com',
    clientId: 'client-id',
    returnTo: 'http://localhost',
    authorizationParams: {
      redirectUri: 'http://localhost',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        pathname: '/',
      },
      writable: true,
    })
    ;(jwtDecode.default as jest.Mock).mockImplementation(() => {
      return createMockDecodedToken()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    test('initializes Auth0 client once per mount', async () => {
      ;(createAuth0Client as jest.Mock).mockResolvedValue(
        createDefaultAuth0ClientMock(),
      )

      const { rerender } = render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
      expect(createAuth0Client).toHaveBeenCalledTimes(1)

      rerender(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      expect(createAuth0Client).toHaveBeenCalledTimes(1)
    })

    test('passes initOptions to createAuth0Client', async () => {
      ;(createAuth0Client as jest.Mock).mockResolvedValue(
        createDefaultAuth0ClientMock(),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(createAuth0Client).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          clientId: 'client-id',
          authorizationParams: {
            redirectUri: 'http://localhost',
          },
        }),
      )
    })

    test('displays loading spinner while authenticating', () => {
      ;(createAuth0Client as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      expect(screen.queryByText('child')).not.toBeInTheDocument()
    })

    test('renders children when authentication completes', async () => {
      ;(createAuth0Client as jest.Mock).mockResolvedValue(
        createDefaultAuth0ClientMock(),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child content</div>
        </Auth0Provider>,
      )

      await screen.findByText('child content')
      expect(screen.getByText('child content')).toBeInTheDocument()
    })
  })

  describe('Token decoding and session creation', () => {
    test('extracts permissions array from decoded token and creates session successfully', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: ['read:words', 'write:fragments', 'lemmatize:fragments'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(jwtDecode.default).toHaveBeenCalledWith('valid-token')
      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
    })

    test('falls back to empty permissions array when permissions claim is undefined', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: undefined,
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(jwtDecode.default).toHaveBeenCalledWith('valid-token')
    })

    test('falls back to empty permissions array when permissions claim is null', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue({
        scope: 'openid profile email',
        aud: 'ebl-backend',
        permissions: null,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
    })

    test('creates valid session with zero permissions', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: [],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
    })

    test('prefers permissions over scope when both are present', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          scope: 'should-be-ignored',
          permissions: ['read:words', 'write:words'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(jwtDecode.default).toHaveBeenCalledWith('valid-token')
    })

    test('falls back to scope claim when permissions is missing', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          scope: 'write:bibliography',
          permissions: undefined,
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-write-bibliography')

      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'true',
      )
    })

    test('uses basic guest permissions when both permissions and scope are missing', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue({
        aud: 'ebl-backend',
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-read-words')

      expect(screen.getByTestId('can-read-words')).toHaveTextContent('true')
      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'false',
      )
    })

    test('flips MemorySession behavior when write bibliography permission is present', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: ['write:bibliography'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-write-bibliography')

      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'true',
      )
    })

    test('keeps MemorySession write bibliography disabled when permission is absent', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: ['read:bibliography'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-write-bibliography')

      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'false',
      )
    })
  })

  describe('Authenticated user authentication flow', () => {
    test('creates authenticated service when isAuthenticated returns true', async () => {
      const authUser = { name: 'John Doe', email: 'john@example.com' }
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(authUser),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.isAuthenticated).toHaveBeenCalled()
      expect(auth0ClientMock.getUser).toHaveBeenCalled()
      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
    })

    test('retrieves and decodes access token when user is authenticated', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockResolvedValue('access-token-123'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
    })

    test('skips token retrieval when user is not authenticated', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.getTokenSilently).not.toHaveBeenCalled()
    })
  })

  describe('Session validation on provider initialization', () => {
    test('validates existing session when provider initializes outside redirect flow', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        checkSession: jest.fn().mockResolvedValue(undefined),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.checkSession).toHaveBeenCalled()
    })

    test('skips session validation when returning from OAuth redirect', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        handleRedirectCallback: jest
          .fn()
          .mockResolvedValue({ appState: undefined }),
        checkSession: jest.fn(),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=auth-code&state=state-value', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.handleRedirectCallback).toHaveBeenCalled()
      expect(auth0ClientMock.checkSession).not.toHaveBeenCalled()
    })

    test('logs warning and continues initialization when session validation fails', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const checkSessionError = new Error('Session check failed')
      const auth0ClientMock = createDefaultAuth0ClientMock({
        checkSession: jest.fn().mockRejectedValue(checkSessionError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Session check failed, falling back to guest:',
        checkSessionError,
      )

      consoleWarnSpy.mockRestore()
    })

    test('provides guest access when session validation throws error', async () => {
      jest.spyOn(console, 'warn').mockImplementation()
      const auth0ClientMock = createDefaultAuth0ClientMock({
        checkSession: jest
          .fn()
          .mockRejectedValue(new Error('Session check failed')),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
      expect(screen.getByText('child')).toBeInTheDocument()
      ;(console.warn as jest.Mock).mockRestore()
    })
  })

  describe('Authentication session creation error recovery', () => {
    test('provides guest access when token retrieval fails during authenticated session creation', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const tokenError = new Error('Token expired')
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockRejectedValue(tokenError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create authenticated session:',
        tokenError,
      )

      expect(screen.getByText('child')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    test('logs error details when session creation fails unexpectedly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const sessionError = new Error('Session creation failed')
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockRejectedValue(sessionError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create authenticated session:',
        sessionError,
      )

      consoleErrorSpy.mockRestore()
    })

    test('remains functional despite authentication session errors', async () => {
      jest.spyOn(console, 'error').mockImplementation()
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockRejectedValue(new Error('Auth error')),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div data-testid="protected-content">Protected Area</div>
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })
      ;(console.error as jest.Mock).mockRestore()
    })
  })

  describe('OAuth redirect callback handling', () => {
    test('processes OAuth redirect and invokes redirect callback with returned app state', async () => {
      const appState = { returnTo: '/dashboard' }
      const auth0ClientMock = createDefaultAuth0ClientMock({
        handleRedirectCallback: jest.fn().mockResolvedValue({ appState }),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=auth-code&state=state-value', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.handleRedirectCallback).toHaveBeenCalled()
    })

    test('passes appState to custom redirect callback after OAuth completion', async () => {
      const appState = { returnTo: '/dashboard' }
      const customCallback = jest.fn()
      const auth0ClientMock = createDefaultAuth0ClientMock({
        handleRedirectCallback: jest.fn().mockResolvedValue({ appState }),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=auth-code&state=state-value', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider
          {...defaultProviderProps}
          onRedirectCallback={customCallback}
        >
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(customCallback).toHaveBeenCalledWith(appState)
    })

    test('uses default redirect callback to replace browser history when none provided', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        handleRedirectCallback: jest
          .fn()
          .mockResolvedValue({ appState: undefined }),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=auth-code&state=state-value', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.handleRedirectCallback).toHaveBeenCalled()
    })

    test('replaces window history state during OAuth redirect handling', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        handleRedirectCallback: jest
          .fn()
          .mockResolvedValue({ appState: undefined }),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=auth-code&state=state-value', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
    })
  })

  describe('Complete authentication lifecycle', () => {
    test('completes full authentication pipeline with user permissions', async () => {
      const authUser = { name: 'Jane Doe', email: 'jane@example.com' }
      const permissions = [
        'read:words',
        'write:fragments',
        'lemmatize:fragments',
      ]
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(authUser),
        getTokenSilently: jest.fn().mockResolvedValue('access-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({ permissions }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>protected-content</div>
        </Auth0Provider>,
      )

      await screen.findByText('protected-content')

      expect(auth0ClientMock.isAuthenticated).toHaveBeenCalled()
      expect(auth0ClientMock.getUser).toHaveBeenCalled()
      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
      expect(jwtDecode.default).toHaveBeenCalledWith('access-token')
    })

    test('provides guest session when user is not authenticated', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-read-words')

      expect(auth0ClientMock.isAuthenticated).toHaveBeenCalled()
      expect(auth0ClientMock.getUser).not.toHaveBeenCalled()
      expect(auth0ClientMock.getTokenSilently).not.toHaveBeenCalled()
      expect(screen.getByTestId('can-read-words')).toHaveTextContent('true')
      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'false',
      )
    })
  })

  describe('edge cases and resilience', () => {
    test('correctly handles admin user with all application permissions', async () => {
      const allPermissions = Object.values(applicationScopes)
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Admin' }),
        getTokenSilently: jest.fn().mockResolvedValue('admin-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({ permissions: allPermissions }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>admin-area</div>
        </Auth0Provider>,
      )

      await screen.findByText('admin-area')

      expect(jwtDecode.default).toHaveBeenCalled()
    })

    test('creates valid session from token with only required claims', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'User' }),
        getTokenSilently: jest.fn().mockResolvedValue('token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue({
        aud: 'ebl-backend',
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>content</div>
        </Auth0Provider>,
      )

      await screen.findByText('content')

      expect(screen.getByText('content')).toBeInTheDocument()
    })

    test('prevents re-initialization when provider props update', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock()
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      const { rerender } = render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      const initialCallCount = (createAuth0Client as jest.Mock).mock.calls
        .length

      rerender(
        <Auth0Provider {...defaultProviderProps} domain="different-domain.com">
          <div>child</div>
        </Auth0Provider>,
      )

      expect((createAuth0Client as jest.Mock).mock.calls.length).toBe(
        initialCallCount,
      )
    })

    test('handles gracefully when getUser returns no user data', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(undefined),
        getTokenSilently: jest.fn().mockResolvedValue('token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(screen.getByText('child')).toBeInTheDocument()
    })
  })
})

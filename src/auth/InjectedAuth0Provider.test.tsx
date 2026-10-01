import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import createAuth0Config from 'auth/createAuth0Config'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { scopeString } from 'auth/Auth'
import InjectedAuth0Provider from 'auth/InjectedAuth0Provider'

type ProviderProps = Parameters<typeof Auth0Provider>[0]

const mockAuth0Provider: jest.MockedFunction<typeof Auth0Provider> = jest.fn()
const mockCreateAuth0Config: jest.MockedFunction<typeof createAuth0Config> =
  jest.fn()

jest.mock('auth/createAuth0Config', () => ({
  __esModule: true,
  default: () => mockCreateAuth0Config(),
}))
jest.mock('auth/react-auth0-spa', () => ({
  Auth0Provider: (props: ProviderProps) => mockAuth0Provider(props),
}))

const mockAuth0Config = {
  domain: 'test-domain.auth0.com',
  clientID: 'test-client-id',
  audience: 'test-audience',
}

function LocationProbe(): JSX.Element {
  return <div data-testid="location">{useLocation().pathname}</div>
}

function renderProvider(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/start']}>
      <InjectedAuth0Provider>
        <LocationProbe />
      </InjectedAuth0Provider>
    </MemoryRouter>,
  )
}

function lastProps(): ProviderProps {
  const calls = mockAuth0Provider.mock.calls
  return calls[calls.length - 1][0]
}

function redirectWith(
  appState: Parameters<NonNullable<ProviderProps['onRedirectCallback']>>[0],
): void {
  act(() => lastProps().onRedirectCallback?.(appState))
}

beforeEach(() => {
  mockCreateAuth0Config.mockReturnValue(mockAuth0Config)
  mockAuth0Provider.mockImplementation(({ children }) => <>{children}</>)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('auth0 configuration', () => {
  test('creates auth0Config only once across renders', () => {
    const { rerender } = renderProvider()
    rerender(
      <MemoryRouter>
        <InjectedAuth0Provider>
          <LocationProbe />
        </InjectedAuth0Provider>
      </MemoryRouter>,
    )
    expect(mockCreateAuth0Config).toHaveBeenCalledTimes(1)
  })

  test('passes domain, client id and fixed provider options', () => {
    renderProvider()
    expect(lastProps()).toMatchObject({
      domain: mockAuth0Config.domain,
      clientId: mockAuth0Config.clientID,
      returnTo: window.location.origin,
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      useCookiesForTransactions: true,
    })
  })

  test('passes authorization params with redirect uri, scope and audience', () => {
    renderProvider()
    expect(lastProps().authorizationParams).toEqual(
      Object.fromEntries([
        ['redirect_uri', window.location.origin],
        ['scope', scopeString],
        ['audience', mockAuth0Config.audience],
      ]),
    )
  })

  test('keeps authorization params stable across renders', () => {
    const { rerender } = renderProvider()
    const first = lastProps().authorizationParams
    rerender(
      <MemoryRouter>
        <InjectedAuth0Provider>
          <LocationProbe />
        </InjectedAuth0Provider>
      </MemoryRouter>,
    )
    expect(lastProps().authorizationParams).toBe(first)
  })

  test('renders its children', () => {
    renderProvider()
    expect(screen.getByTestId('location')).toHaveTextContent('/start')
  })
})

describe('onRedirectCallback', () => {
  test('navigates to the target url from the app state', () => {
    renderProvider()
    redirectWith({ targetUrl: '/test-path' })
    expect(screen.getByTestId('location')).toHaveTextContent('/test-path')
  })

  test.each([
    ['an app state without target url', {}],
    ['an undefined app state', undefined],
  ])('navigates to the current pathname for %s', (_label, appState) => {
    renderProvider()
    redirectWith(appState)
    expect(screen.getByTestId('location')).toHaveTextContent(
      window.location.pathname,
    )
  })
})

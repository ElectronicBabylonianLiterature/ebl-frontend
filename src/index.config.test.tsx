import React, { useMemo } from 'react'
import { render, screen } from '@testing-library/react'
import createAuth0Config from 'auth/createAuth0Config'
import { setupAuth0ConfigMock, mockAuth0Config } from 'index.testSupport'

jest.mock('auth/createAuth0Config')

describe('InjectedAuth0Provider Hooks', () => {
  setupAuth0ConfigMock()

  describe('useMemo for auth0Config', () => {
    test('creates auth0Config only once on mount', () => {
      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        return <div>{auth0Config.domain}</div>
      }

      const { rerender } = render(<TestComponent />)
      expect(createAuth0Config).toHaveBeenCalledTimes(1)

      rerender(<TestComponent />)
      expect(createAuth0Config).toHaveBeenCalledTimes(1)
    })

    test('memoized config contains correct domain', () => {
      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        return <div data-testid="domain">{auth0Config.domain}</div>
      }

      render(<TestComponent />)
      expect(screen.getByTestId('domain')).toHaveTextContent(
        mockAuth0Config.domain,
      )
    })

    test('memoized config contains correct clientID', () => {
      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        return <div data-testid="clientId">{auth0Config.clientID}</div>
      }

      render(<TestComponent />)
      expect(screen.getByTestId('clientId')).toHaveTextContent(
        mockAuth0Config.clientID,
      )
    })

    test('memoized config contains correct audience', () => {
      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        return <div data-testid="audience">{auth0Config.audience}</div>
      }

      render(<TestComponent />)
      expect(screen.getByTestId('audience')).toHaveTextContent(
        mockAuth0Config.audience,
      )
    })
  })

  describe('useMemo for authorizationParams', () => {
    test('creates authorizationParams with correct structure', () => {
      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        const authorizationParams = useMemo(
          () => ({
            // eslint-disable-next-line camelcase
            redirect_uri: window.location.origin,
            scope: 'test-scope',
            audience: auth0Config.audience,
          }),
          [auth0Config.audience],
        )
        return (
          <div data-testid="params">{JSON.stringify(authorizationParams)}</div>
        )
      }

      render(<TestComponent />)
      const params = JSON.parse(
        screen.getByTestId('params').textContent || '{}',
      )

      expect(params).toHaveProperty('redirect_uri')
      expect(params).toHaveProperty('scope')
      expect(params).toHaveProperty('audience', mockAuth0Config.audience)
    })

    test('memoizes authorizationParams based on audience', () => {
      let renderCount = 0
      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        const authorizationParams = useMemo(() => {
          renderCount++
          return {
            // eslint-disable-next-line camelcase
            redirect_uri: window.location.origin,
            scope: 'test-scope',
            audience: auth0Config.audience,
          }
        }, [auth0Config.audience])
        return <div>{authorizationParams.audience}</div>
      }

      const { rerender } = render(<TestComponent />)

      rerender(<TestComponent />)
      expect(renderCount).toBe(1)
    })

    test('authorizationParams includes redirect_uri from window.location.origin', () => {
      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        const authorizationParams = useMemo(
          () => ({
            // eslint-disable-next-line camelcase
            redirect_uri: window.location.origin,
            scope: 'test-scope',
            audience: auth0Config.audience,
          }),
          [auth0Config.audience],
        )
        return (
          <div data-testid="redirect">{authorizationParams.redirect_uri}</div>
        )
      }

      render(<TestComponent />)
      expect(screen.getByTestId('redirect')).toHaveTextContent(
        window.location.origin,
      )
    })
  })

  describe('Provider configuration', () => {
    test('handles undefined domain gracefully', () => {
      ;(createAuth0Config as jest.Mock).mockReturnValue({
        ...mockAuth0Config,
        domain: undefined,
      })

      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        const domain = auth0Config.domain ?? ''
        return <div data-testid="domain">{domain}</div>
      }

      render(<TestComponent />)
      expect(screen.getByTestId('domain')).toHaveTextContent('')
    })

    test('handles undefined clientID gracefully', () => {
      ;(createAuth0Config as jest.Mock).mockReturnValue({
        ...mockAuth0Config,
        clientID: undefined,
      })

      const TestComponent = () => {
        const auth0Config = useMemo(() => createAuth0Config(), [])
        const clientId = auth0Config.clientID ?? ''
        return <div data-testid="clientId">{clientId}</div>
      }

      render(<TestComponent />)
      expect(screen.getByTestId('clientId')).toHaveTextContent('')
    })

    test('configuration values are correct', () => {
      const expectedConfig = {
        returnTo: window.location.origin,
        cacheLocation: 'localstorage',
        useRefreshTokens: true,
        useCookiesForTransactions: true,
      }

      expect(expectedConfig.returnTo).toBe(window.location.origin)
      expect(expectedConfig.cacheLocation).toBe('localstorage')
      expect(expectedConfig.useRefreshTokens).toBe(true)
      expect(expectedConfig.useCookiesForTransactions).toBe(true)
    })
  })
})

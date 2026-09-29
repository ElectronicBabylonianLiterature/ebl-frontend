import React, { useCallback } from 'react'
import { render, screen } from '@testing-library/react'
import { setupAuth0ConfigMock } from 'index.testSupport'

jest.mock('auth/createAuth0Config')

describe('InjectedAuth0Provider Hooks', () => {
  setupAuth0ConfigMock()

  describe('useCallback for onRedirectCallback', () => {
    test('creates callback that handles targetUrl', () => {
      const mockPush = jest.fn()
      const TestComponent = () => {
        const onRedirectCallback = useCallback((appState: unknown): void => {
          type AppState = { targetUrl?: string }
          const targetUrl = (appState as AppState | undefined)?.targetUrl
          mockPush(targetUrl ? targetUrl : window.location.pathname)
        }, [])

        return (
          <button
            data-testid="button"
            onClick={() => onRedirectCallback({ targetUrl: '/test-path' })}
          >
            Test
          </button>
        )
      }

      render(<TestComponent />)
      screen.getByTestId('button').click()

      expect(mockPush).toHaveBeenCalledWith('/test-path')
    })

    test('callback uses current pathname when targetUrl not provided', () => {
      const mockPush = jest.fn()
      const originalPathname = window.location.pathname

      Object.defineProperty(window, 'location', {
        value: { ...window.location, pathname: '/current-path' },
        writable: true,
        configurable: true,
      })

      const TestComponent = () => {
        const onRedirectCallback = useCallback((appState: unknown): void => {
          type AppState = { targetUrl?: string }
          const targetUrl = (appState as AppState | undefined)?.targetUrl
          mockPush(targetUrl ? targetUrl : window.location.pathname)
        }, [])

        return (
          <button data-testid="button" onClick={() => onRedirectCallback({})}>
            Test
          </button>
        )
      }

      render(<TestComponent />)
      screen.getByTestId('button').click()

      expect(mockPush).toHaveBeenCalledWith('/current-path')

      Object.defineProperty(window, 'location', {
        value: { ...window.location, pathname: originalPathname },
        writable: true,
        configurable: true,
      })
    })

    test('callback handles undefined appState', () => {
      const mockPush = jest.fn()

      const TestComponent = () => {
        const onRedirectCallback = useCallback((appState: unknown): void => {
          type AppState = { targetUrl?: string }
          const targetUrl = (appState as AppState | undefined)?.targetUrl
          mockPush(targetUrl ? targetUrl : window.location.pathname)
        }, [])

        return (
          <button
            data-testid="button"
            onClick={() => onRedirectCallback(undefined)}
          >
            Test
          </button>
        )
      }

      render(<TestComponent />)
      screen.getByTestId('button').click()

      expect(mockPush).toHaveBeenCalledWith(window.location.pathname)
    })

    test('callback is memoized', () => {
      let renderCount = 0
      const mockPush = jest.fn()

      const TestComponent = () => {
        renderCount++
        useCallback((appState: unknown): void => {
          type AppState = { targetUrl?: string }
          const targetUrl = (appState as AppState | undefined)?.targetUrl
          mockPush(targetUrl ? targetUrl : window.location.pathname)
        }, [])

        return <div data-testid="test">Test</div>
      }

      const { rerender } = render(<TestComponent />)
      expect(renderCount).toBe(1)

      rerender(<TestComponent />)
      expect(renderCount).toBe(2)
    })
  })
})

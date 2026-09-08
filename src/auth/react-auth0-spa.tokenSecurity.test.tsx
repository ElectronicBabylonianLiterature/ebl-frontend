import { screen, waitFor } from '@testing-library/react'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import { expectConsoleErrors } from 'setupTests'
import {
  createMockAuth0Client,
  renderWithAuth0Provider,
} from 'auth/react-auth0-spa.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

const mockCreateAuth0Client = createAuth0Client as jest.MockedFunction<
  typeof createAuth0Client
>

describe('Security: token handling', () => {
  beforeEach(() => {
    expectConsoleErrors(/Failed to create authenticated session/)
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('localStorage Token Security', () => {
    it('should not trust localStorage tokens without validation', async () => {
      localStorage.setItem('auth0.token', 'expired-token')

      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Login required')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      renderWithAuth0Provider('App')

      await waitFor(() => {
        expect(screen.getByText('App')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })
  })

  describe('Network Failure Handling', () => {
    it('should handle network errors during auth initialization', async () => {
      const networkError = new Error('Network error')
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(networkError),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      renderWithAuth0Provider('Content')

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })

      expect(mockClient.isAuthenticated).toHaveBeenCalled()
      expect(consoleWarn).toHaveBeenCalledWith(
        'Session check failed, falling back to guest:',
        networkError,
      )

      consoleWarn.mockRestore()
    })
  })

  describe('Token Refresh Edge Cases', () => {
    it('should handle token refresh failures gracefully', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest
          .fn()
          .mockResolvedValueOnce('valid-token')
          .mockRejectedValueOnce(new Error('Refresh failed')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      renderWithAuth0Provider('Test')

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })
  })
})

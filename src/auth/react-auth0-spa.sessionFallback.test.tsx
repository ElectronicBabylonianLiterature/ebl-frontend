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

describe('Security: session fallback', () => {
  beforeEach(() => {
    expectConsoleErrors(/Failed to create authenticated session/)
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Expired Token Handling', () => {
    it('should fall back to guest session when token validation fails', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Login required')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      renderWithAuth0Provider('Test')

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })

    it('should handle "Consent required" error and fall back to guest', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Consent required')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      renderWithAuth0Provider('Test')

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })

    it('should handle corrupted token by falling back to guest session', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockRejectedValue(new Error('Invalid token')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      renderWithAuth0Provider('Test')

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })
    })
  })

  describe('Session Check Failure Handling', () => {
    it('should gracefully handle checkSession() failures', async () => {
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(new Error('Network error')),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      renderWithAuth0Provider('Test')

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.checkSession).toHaveBeenCalled()
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Session check failed'),
        expect.any(Error),
      )

      consoleWarn.mockRestore()
    })

    it('should create guest session when checkSession() fails', async () => {
      const sessionError = new Error('Session expired')
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(sessionError),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      renderWithAuth0Provider('Loaded')

      await waitFor(() => {
        expect(screen.getByText('Loaded')).toBeInTheDocument()
      })

      expect(mockClient.isAuthenticated).toHaveBeenCalled()
      expect(consoleWarn).toHaveBeenCalledWith(
        'Session check failed, falling back to guest:',
        sessionError,
      )

      consoleWarn.mockRestore()
    })
  })
})

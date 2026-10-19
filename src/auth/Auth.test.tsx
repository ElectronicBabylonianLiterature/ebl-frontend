import { renderHook } from '@testing-library/react'
import { useAuthentication } from 'auth/Auth'
import { guestSession } from 'auth/Session'

test('defaults to an unauthenticated guest without a provider', async () => {
  const { result } = renderHook(() => useAuthentication())
  const authentication = result.current
  expect(authentication.login()).toBeUndefined()
  await expect(authentication.logout()).resolves.toBeUndefined()
  expect(authentication.getSession()).toBe(guestSession)
  expect(authentication.isAuthenticated()).toBe(false)
  expect(() => authentication.getAccessToken()).toThrow('Not authenticated')
  expect(() => authentication.getUser()).toThrow('Not authenticated')
})

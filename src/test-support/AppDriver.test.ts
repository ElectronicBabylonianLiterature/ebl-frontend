import AppDriver from 'test-support/AppDriver'
import { driverAuthentication } from 'test-support/appDriverHelpers'
import FakeApi from 'test-support/FakeApi'
import MemorySession, { guestSession } from 'auth/Session'
import { eblNameProperty } from 'auth/Auth'

test('getView fails before rendering', () => {
  expect(() => new AppDriver(new FakeApi().client).getView()).toThrow(
    'getElement called before render.',
  )
})

describe('driverAuthentication', () => {
  test('acts as a guest without a session', async () => {
    const authentication = driverAuthentication(() => null)
    expect(authentication.getSession()).toBe(guestSession)
    expect(authentication.isAuthenticated()).toBe(false)
    expect(authentication.login()).toBeUndefined()
    await expect(authentication.logout()).resolves.toBeUndefined()
    await expect(authentication.getAccessToken()).rejects.toThrow(
      'Not implemented',
    )
  })

  test('uses the session when present', () => {
    const session = new MemorySession(['read:texts'])
    const authentication = driverAuthentication(() => session)
    expect(authentication.getSession()).toBe(session)
    expect(authentication.isAuthenticated()).toBe(true)
    expect(authentication.getUser()).toEqual({ [eblNameProperty]: 'Test' })
  })
})

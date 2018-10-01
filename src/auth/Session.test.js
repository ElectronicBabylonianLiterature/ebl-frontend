import { advanceBy, advanceTo, clear } from 'jest-date-mock'
import Session from './Session'

const now = new Date()

beforeEach(() => {
  advanceTo(now)
})

afterEach(clear)

test('constructor', () => {
  const expiresAt = now.getTime()
  const scopes = ['scope']
  const session = new Session('accessToken', 'idToken', expiresAt, scopes)
  expect(session.accessToken).toEqual('accessToken')
  expect(session.idToken).toEqual('idToken')
  expect(session.expiresAt).toEqual(expiresAt)
  expect(session.scopes).toEqual(scopes)
})

describe('isAuthenticated', () => {
  describe('Logged in', () => {
    const session = new Session('accessToken', 'idToken', now.getTime(), [])

    it('Returns true if token is valid', () => {
      advanceBy(-1)
      expect(session.isAuthenticated()).toBe(true)
    })

    it('Returns false if token is expired', () => {
      advanceBy(1)
      expect(session.isAuthenticated()).toBe(false)
    })
  })

  describe('Logged out', () => {
    it('Returns false', () => {
      const session = new Session('', '', 0, [])
      expect(session.isAuthenticated()).toBe(false)
    })
  })
})

describe('hasScope', () => {
  const scope = 'write:words'
  const scopes = `profile ${scope} read:words`
  const session = new Session('accessToken', 'idToken', now.getTime(), scopes)

  describe('Is authenticated', () => {
    describe('Has scope', () => {
      it('Returns true', () => {
        advanceBy(-1)
        expect(session.hasScope(scope)).toBe(true)
      })
    })

    describe('Does not have scope', () => {
      it('Returns false', () => {
        advanceBy(-1)
        expect(session.hasScope('read:transliterations')).toBe(false)
      })
    })
  })

  describe('Not authenticated', () => {
    it('Returns false', () => {
      advanceBy(1)
      expect(session.hasScope(scope)).toBe(false)
    })
  })
})

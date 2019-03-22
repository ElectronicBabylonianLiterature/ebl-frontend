import Auth from './Auth'
import auth0 from 'auth0-js'
import _ from 'lodash'
import { advanceTo, clear, advanceBy } from 'jest-date-mock'
import Session from './Session'

const eblNameProperty = 'https://ebabylon.org/eblName'
const now = new Date()
let sessionStore
let errorReporter
let auth

beforeEach(() => {
  advanceTo(now)
  sessionStore = {
    getSession: jest.fn(),
    clearSession: jest.fn(),
    setSession: jest.fn()
  }
  errorReporter = {
    setUser: jest.fn(),
    clearScope: jest.fn()
  }
  auth = new Auth(sessionStore, errorReporter)
  jest.spyOn(auth.auth0, 'parseHash')
  jest.spyOn(auth.auth0, 'authorize')
})

afterEach(clear)

test('WebAuth is created', () => {
  expect(auth.auth0).toEqual(expect.any(auth0.WebAuth))
})

test('Login calls WebAuth.authorize', () => {
  jest.spyOn(auth.auth0, 'authorize').mockImplementationOnce(_.noop)
  auth.login()
  expect(auth.auth0.authorize).toBeCalled()
})

describe('logout', () => {
  beforeEach(() => {
    jest.spyOn(auth.auth0, 'logout').mockImplementationOnce(_.noop)
    auth.logout()
  })

  test('Clears session', () => {
    expect(sessionStore.clearSession).toBeCalled()
  })

  test('Clears scope', () => {
    expect(errorReporter.clearScope).toBeCalled()
  })

  test('Calls WebAuth.logout', () => {
    expect(auth.auth0.logout).toBeCalledWith({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: process.env.REACT_APP_AUTH0_RETURN_TO
    })
  })
})

describe('handleAuthentication', () => {
  function testParseHash (authResultConfig, scopes) {
    const authResult = {
      accessToken: 'accessToken',
      idToken: 'idToken',
      expiresIn: 1,
      idTokenPayload: {
        'https://ebabylon.org/eblName': 'Tester',
        name: 'test@example.com',
        sub: 'auth0|1234'
      },
      ...authResultConfig
    }

    const expectedSession = new Session(
      authResult.accessToken,
      authResult.idToken,
      now.getTime() + authResult.expiresIn * 1000,
      scopes.split(' ')
    )

    beforeEach(async () => {
      jest.spyOn(auth.auth0, 'parseHash')
        .mockImplementationOnce(callback => callback(null, authResult))
      await auth.handleAuthentication()
    })

    it('Sets session', () => {
      expect(sessionStore.setSession).toBeCalledWith(expectedSession)
    })

    it('Sets user', () => {
      const { sub, [eblNameProperty]: eblName, name } = authResult.idTokenPayload
      expect(errorReporter.setUser).toBeCalledWith(sub, name, eblName)
    })
  }

  describe('authResult has scope', () => {
    const scope = 'write:words'
    testParseHash({ scope: scope }, scope)
  })

  describe('authResult does not have scope', () => {
    const expectedScope = [
      'openid',
      'profile',
      'read:words write:words',
      'read:fragments transliterate:fragments lemmatize:fragments',
      'read:bibliography write:bibliography',
      'access:beta',
      'read:WGL-folios',
      'read:FWG-folios',
      'read:EL-folios',
      'read:AKG-folios',
      'read:MJG-folios'
    ].join(' ')
    testParseHash({ scope: null }, expectedScope)
  })

  describe('Hash is parsed with error', () => {
    const error = {
      error: 'invalid_hash',
      errorDescription: 'response_type contains `id_token`, but the parsed hash does not contain an `id_token` property'
    }
    beforeEach(() => {
      jest.spyOn(auth.auth0, 'parseHash')
        .mockImplementationOnce(callback =>
          callback(error, null)
        )
    })

    test('Rejects with the error', async () => {
      await expect(auth.handleAuthentication()).rejects.toEqual(new Error(error.error))
    })
  })
})

describe('Session', () => {
  const session = new Session('accessToken', 'idToken', now.getTime(), [])

  beforeEach(() => sessionStore.getSession.mockReturnValue(session))

  test('isAuhenticated', () => {
    expect(auth.isAuthenticated()).toEqual(session.isAuthenticated())
  })

  test('getSession', () => {
    expect(auth.getSession()).toEqual(session)
  })

  describe('getAccessToken', () => {
    test('active session', () => {
      advanceBy(-1)
      expect(auth.getAccessToken()).toEqual(session.accessToken)
    })

    test('expired session', () => {
      expect(() => auth.getAccessToken()).toThrow(new Error('Session expired.'))
    })
  })
})

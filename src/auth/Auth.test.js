import Auth from './Auth'
import auth0 from 'auth0-js'
import _ from 'lodash'
import { advanceTo, clear } from 'jest-date-mock'
import Session from './Session'

const now = new Date()
let sessionStore
let auth

beforeEach(() => {
  advanceTo(now)
  sessionStore = {
    getSession: jest.fn(),
    clearSession: jest.fn(),
    setSession: jest.fn()
  }
  auth = new Auth(sessionStore)
  jest.spyOn(auth.auth0, 'parseHash')
  jest.spyOn(auth.auth0, 'authorize')
})

afterEach(clear)

it('WebAuth is created', () => {
  expect(auth.auth0).toEqual(expect.any(auth0.WebAuth))
})

it('Login calls WebAuth.authorize', () => {
  jest.spyOn(auth.auth0, 'authorize').mockImplementationOnce(_.noop)
  auth.login()
  expect(auth.auth0.authorize).toBeCalled()
})

describe('logout', () => {
  beforeEach(() => {
    jest.spyOn(auth.auth0, 'logout').mockImplementationOnce(_.noop)
    auth.logout()
  })

  it('Clears session', () => {
    expect(sessionStore.clearSession).toBeCalled()
  })

  it('Calls WebAuth.logout', () => {
    expect(auth.auth0.logout).toBeCalledWith({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: process.env.REACT_APP_AUTH0_RETURN_TO
    })
  })
})

it('isAuthenticaed returns isAuthenticated from session', () => {
  const session = new Session('accessToken', 'idToken', now.getTime(), [])
  jest.spyOn(session, 'isAuthenticated').mockReturnValue(true)
  sessionStore.getSession.mockReturnValue(session)
  expect(auth.isAuthenticated()).toBe(true)
})

it('getAccessToken returns access toke', () => {
  const accessToken = 'token'
  const session = new Session(accessToken, 'idToken', now.getTime(), [])
  sessionStore.getSession.mockReturnValue(session)
  expect(auth.getAccessToken()).toEqual(accessToken)
})

describe('handleAuthentication', () => {
  function testParseHash (authResultConfig, scopes) {
    const authResult = {
      accessToken: 'accessToken',
      idToken: 'idToken',
      expiresIn: 1,
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
  }

  describe('authResult has scope', () => {
    const scope = 'write:words'
    testParseHash({ scope: scope }, scope)
  })

  describe('authResult does not have scope', () => {
    const expectedScope = 'openid profile read:words write:words read:fragments transliterate:fragments'
    testParseHash({ scope: null }, expectedScope)
  })

  describe('Hash is parsed with error', () => {
    const message = 'error'
    const error = new Error(message)
    beforeEach(() => {
      jest.spyOn(auth.auth0, 'parseHash')
        .mockImplementationOnce(callback =>
          callback(new Error(message), null)
        )
    })

    it('Rejects with the error', async () => {
      await expect(auth.handleAuthentication()).rejects.toEqual(error)
    })
  })
})

import Auth from './Auth'
import auth0 from 'auth0-js'
import _ from 'lodash'
import { advanceTo, clear, advanceBy } from 'jest-date-mock'
import Session from './Session'
import createAuth0Config from './createAuth0Config'

jest.mock('auth0-js')

const eblNameProperty = 'https://ebabylon.org/eblName'
const auth0Config = createAuth0Config()
const expectedScope = [
  'openid',
  'profile',
  'read:words',
  'write:words',
  'read:fragments',
  'transliterate:fragments',
  'lemmatize:fragments',
  'annotate:fragments',
  'read:bibliography',
  'write:bibliography',
  'read:texts',
  'write:texts',
  'access:beta',
  'read:WGL-folios',
  'read:FWG-folios',
  'read:EL-folios',
  'read:AKG-folios',
  'read:MJG-folios',
  'read:USK-folios',
  'read:ILF-folios',
].join(' ')
const now = new Date()
let sessionStore
let errorReporter
let auth
let auth0mock

beforeEach(() => {
  auth0.WebAuth.mockClear()
  advanceTo(now)
  sessionStore = {
    getSession: jest.fn(),
    clearSession: jest.fn(),
    setSession: jest.fn(),
  }
  errorReporter = {
    setUser: jest.fn(),
    clearScope: jest.fn(),
  }
  auth = new Auth(sessionStore, errorReporter, auth0Config)
  auth0mock = auth0.WebAuth.mock.instances[0]
})

afterEach(clear)

test('WebAuth is created', () => {
  expect(auth0.WebAuth).toBeCalledWith({
    domain: auth0Config.domain,
    clientID: auth0Config.clientID,
    redirectUri: auth0Config.redirectUri,
    audience: auth0Config.audience,
    responseType: 'token id_token',
    scope: expectedScope,
  })
})

test('Login calls WebAuth.authorize', () => {
  auth0mock.authorize.mockImplementationOnce(_.noop)
  auth.login()
  expect(auth0mock.authorize).toBeCalled()
})

describe('logout', () => {
  beforeEach(() => {
    auth0mock.logout.mockImplementationOnce(_.noop)
    auth.logout()
  })

  test('Clears session', () => {
    expect(sessionStore.clearSession).toBeCalled()
  })

  test('Clears scope', () => {
    expect(errorReporter.clearScope).toBeCalled()
  })

  test('Calls WebAuth.logout', () => {
    expect(auth0mock.logout).toBeCalledWith({
      clientID: auth0Config.clientID,
      returnTo: auth0Config.returnTo,
    })
  })
})

describe('handleAuthentication', () => {
  function testParseHash(
    authResultConfig: { [key: string]: string | null },
    scopes: string
  ): void {
    const authResult = {
      accessToken: 'accessToken',
      idToken: 'idToken',
      expiresIn: 1,
      idTokenPayload: {
        'https://ebabylon.org/eblName': 'Tester',
        name: 'test@example.com',
        sub: 'auth0|1234',
      },
      ...authResultConfig,
    }

    const expectedSession = new Session(
      authResult.accessToken,
      authResult.idToken,
      now.getTime() + authResult.expiresIn * 1000,
      scopes.split(' ')
    )

    beforeEach(async () => {
      auth0mock.parseHash.mockImplementationOnce((callback) =>
        callback(null, authResult)
      )
      await auth.handleAuthentication()
    })

    it('Sets session', () => {
      expect(sessionStore.setSession).toBeCalledWith(expectedSession)
    })

    it('Sets user', () => {
      const {
        sub,
        [eblNameProperty]: eblName,
        name,
      } = authResult.idTokenPayload
      expect(errorReporter.setUser).toBeCalledWith(sub, name, eblName)
    })
  }

  describe('authResult has scope', () => {
    const scope = 'write:words'
    testParseHash({ scope: scope }, scope)
  })

  describe('authResult does not have scope', () => {
    testParseHash({ scope: null }, expectedScope)
  })

  describe('Hash is parsed with error', () => {
    const error = {
      error: 'invalid_hash',
      errorDescription:
        'response_type contains `id_token`, but the parsed hash does not contain an `id_token` property',
    }
    beforeEach(() => {
      auth0mock.parseHash.mockImplementationOnce((callback) =>
        callback(error, null)
      )
    })

    test('Rejects with the error', async () => {
      await expect(auth.handleAuthentication()).rejects.toEqual(
        new Error(error.error)
      )
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
      expect(auth.getAccessToken()).toEqual(session.getAccessToken())
    })

    test('expired session', () => {
      expect(() => auth.getAccessToken()).toThrow(new Error('Session expired.'))
    })
  })
})

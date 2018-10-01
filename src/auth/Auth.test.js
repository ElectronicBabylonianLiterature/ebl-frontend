import Auth from './Auth'
import auth0 from 'auth0-js'
import _ from 'lodash'
import { advanceBy, advanceTo, clear } from 'jest-date-mock'

const now = new Date(2018, 6, 6, 0, 0, 0)
let auth

function mockSession (accessToken, idToken, expiresAt, scopes) {
  const session = {
    access_token: accessToken,
    id_token: idToken,
    expires_at: expiresAt,
    scopes: scopes
  }
  localStorage.getItem.mockImplementation(key => session[key] || null)
}

beforeEach(() => {
  advanceTo(now)
  auth = new Auth()
  jest.spyOn(auth.auth0, 'parseHash')
  jest.spyOn(auth.auth0, 'authorize')
})

afterEach(clear)

it('WebAuth is created', () => {
  expect(auth.auth0 instanceof auth0.WebAuth).toBeTruthy()
})

describe('login', () => {
  beforeEach(() => {
    jest.spyOn(auth.auth0, 'authorize').mockImplementationOnce(_.noop)
    auth.login()
  })

  it('Calls WebAuth.authorize', () => {
    expect(auth.auth0.authorize).toBeCalled()
  })
})

describe('logout', () => {
  const keys = ['access_token', 'id_token', 'expires_at', 'scopes']

  beforeEach(() => {
    jest.spyOn(auth.auth0, 'logout').mockImplementationOnce(_.noop)
    auth.logout()
  })

  for (let key of keys) {
    it(`Removes ${key} from local storage`, () => {
      expect(localStorage.removeItem).toBeCalledWith(key)
    })
  }

  it('Calls WebAuth.logout', () => {
    expect(auth.auth0.logout).toBeCalledWith({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: process.env.REACT_APP_AUTH0_RETURN_TO
    })
  })
})

describe('isAuthenticated', () => {
  describe('Token is valid', () => {
    it('Returns true', () => {
      mockSession(null, null, Date.now(), null)
      advanceBy(-1)
      expect(auth.isAuthenticated()).toBe(true)
    })
  })

  describe('Token is expired', () => {
    it('Returns false', () => {
      mockSession(null, null, Date.now(), null)
      advanceBy(1)
      expect(auth.isAuthenticated()).toBe(false)
    })
  })

  describe('Logged out', () => {
    it('Returns false', () => {
      mockSession(null, null, null, null)
      expect(auth.isAuthenticated()).toBe(false)
    })
  })
})

describe('getAccessToken', () => {
  describe('Token exists', () => {
    it('Returns the token', () => {
      const accessToken = 'token'
      mockSession(accessToken, null, null, null)
      expect(auth.getAccessToken()).toBe(accessToken)
    })
  })

  describe('Token does not exist', () => {
    it('Throws an Error', () => {
      mockSession(null, null, null, null)
      expect(() => auth.getAccessToken()).toThrow()
    })
  })
})

describe('handleAuthentication', () => {
  function testParseHash (authResultConfig, scopes) {
    const authResult = {
      accessToken: 'accessToken',
      idToken: 'idToken',
      expiresIn: 1,
      ...authResultConfig
    }

    const expectedSession = {
      access_token: authResult.accessToken,
      id_token: authResult.idToken,
      expires_at: JSON.stringify(now.getTime() + authResult.expiresIn * 1000),
      scopes: scopes
    }

    beforeEach(async () => {
      jest.spyOn(auth.auth0, 'parseHash')
        .mockImplementationOnce(callback => callback(null, authResult))
      await auth.handleAuthentication()
    })

    _.forEach(expectedSession, (value, key) => {
      it(`Sets ${key} in local storage`, () => {
        expect(localStorage.setItem).toBeCalledWith(key, value)
      })
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

describe('hasScope', () => {
  const scope = 'write:words'
  const scopes = `profile ${scope} read:words`

  function setupLocalStorage (scopes, time) {
    mockSession(null, null, Date.now(), scopes)
    advanceBy(time)
  }

  describe('Is authenticated', () => {
    describe('Has scope', () => {
      it('Returns true', () => {
        setupLocalStorage(scopes, -1)
        expect(auth.hasScope(scope)).toBe(true)
      })
    })

    describe('Does not have scope', () => {
      it('Returns false', () => {
        setupLocalStorage(scopes, -1)
        expect(auth.hasScope('read:transliterations')).toBe(false)
      })
    })

    describe('Scopes does not exist', () => {
      it('Returns false', () => {
        setupLocalStorage(null, -1)
        expect(auth.hasScope(scope)).toBe(false)
      })
    })
  })

  describe('Not authenticated', () => {
    it('Returns false', () => {
      setupLocalStorage(scopes, 1)
      expect(auth.hasScope(scope)).toBe(false)
    })
  })
})

import Auth from './Auth'
import auth0 from 'auth0-js'
import _ from 'lodash'
import { advanceBy, advanceTo, clear } from 'jest-date-mock'

const now = new Date(2018, 6, 6, 0, 0, 0)
let auth

beforeEach(() => {
  advanceTo(now)
  auth = new Auth()
  jest.spyOn(auth.auth0, 'parseHash')
  jest.spyOn(auth.auth0, 'authorize')
})

afterEach(clear)

describe('WebAuth', () => {
  it('Is created', () => {
    expect(auth.auth0 instanceof auth0.WebAuth).toBeTruthy()
  })
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
      localStorage.getItem.mockReturnValueOnce(Date.now())
      advanceBy(-1)
      expect(auth.isAuthenticated()).toBe(true)
    })
  })

  describe('Token is expired', () => {
    it('Returns false', () => {
      localStorage.getItem.mockReturnValueOnce(Date.now())
      advanceBy(1)
      expect(auth.isAuthenticated()).toBe(false)
    })
  })

  describe('Logged out', () => {
    it('Returns false', () => {
      localStorage.getItem.mockReturnValueOnce(null)
      expect(auth.isAuthenticated()).toBe(false)
    })
  })
})

describe('getAccessToken', () => {
  describe('Token exists', () => {
    it('Returns the token', () => {
      const accessToken = 'token'
      localStorage.getItem.mockReturnValueOnce(accessToken)
      expect(auth.getAccessToken()).toBe(accessToken)
    })
  })

  describe('Token does not exist', () => {
    it('Throws an Error', () => {
      localStorage.getItem.mockReturnValueOnce(null)
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

    beforeEach(() => {
      jest.spyOn(auth.auth0, 'parseHash')
        .mockImplementationOnce(callback => callback(null, authResult))
    })

    it('Resolves', () => {
      expect(auth.handleAuthentication()).resolves.toBeUndefined()
    })

    describe('Session', () => {
      const expectedSession = {
        access_token: authResult.accessToken,
        id_token: authResult.idToken,
        expires_at: JSON.stringify(now.getTime() + authResult.expiresIn * 1000),
        scopes: scopes
      }

      beforeEach(async () => {
        await auth.handleAuthentication()
      })

      _.forEach(expectedSession, (value, key) => {
        it(`Sets ${key} in local storage`, () => {
          expect(localStorage.setItem).toBeCalledWith(key, value)
        })
      })
    })
  }

  describe('authResult has scope', () => {
    const scope = 'write:words'
    testParseHash({scope: scope}, scope)
  })

  describe('authResult does not have scope', () => {
    const expectedScope = 'openid profile read:words write:words read:fragments transliterate:fragments'
    testParseHash({scope: null}, expectedScope)
  })

  describe('Hash is parsed with error', () => {
    beforeEach(() => {
      jest.spyOn(auth.auth0, 'parseHash')
        .mockImplementationOnce(callback => callback(new Error('error'), null))
    })

    it('Rejects with the error', () => {
      expect(auth.handleAuthentication()).rejects.toThrow('error')
    })
  })
})

describe('isAllowedTo', () => {
  const scope = 'write:words'
  const scopes = `profile ${scope} read:words`

  function setupLocalStorage (scopes, time) {
    const storage = {
      expires_at: Date.now(),
      scopes: scopes
    }
    localStorage.getItem.mockImplementation(key => storage[key])
    advanceBy(time)
  }

  describe('Is authenticated', () => {
    describe('Has scope', () => {
      it('Returns true', () => {
        setupLocalStorage(scopes, -1)
        expect(auth.isAllowedTo(scope)).toBe(true)
      })
    })

    describe('Does not have scope', () => {
      it('Returns false', () => {
        setupLocalStorage(scopes, -1)
        expect(auth.isAllowedTo('read:transliterations')).toBe(false)
      })
    })

    describe('Scopes does not exist', () => {
      it('Returns false', () => {
        setupLocalStorage(null, -1)
        expect(auth.isAllowedTo(scope)).toBe(false)
      })
    })
  })

  describe('Not authenticated', () => {
    it('Returns false', () => {
      setupLocalStorage(scopes, 1)
      expect(auth.isAllowedTo(scope)).toBe(false)
    })
  })
})

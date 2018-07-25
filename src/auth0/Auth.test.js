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
  beforeEach(() => {
    jest.spyOn(auth.auth0, 'logout').mockImplementationOnce(_.noop)
    auth.logout()
  })

  it('Removes access token', () => {
    expect(localStorage.removeItem).toBeCalledWith('access_token')
  })

  it('Removes ID token', () => {
    expect(localStorage.removeItem).toBeCalledWith('id_token')
  })

  it('Removes expires at', () => {
    expect(localStorage.removeItem).toBeCalledWith('expires_at')
  })

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
  describe('Hash is parsed successfully', () => {
    const authResult = {accessToken: 'accessToken', idToken: 'idToken', expiresIn: 1}
    beforeEach(() => {
      jest.spyOn(auth.auth0, 'parseHash')
        .mockImplementationOnce(callback => callback(null, authResult))
    })

    it('Resolves', () => {
      expect(auth.handleAuthentication()).resolves.toBeUndefined()
    })

    describe('Session', () => {
      beforeEach(async () => {
        await auth.handleAuthentication()
      })

      it('Sets access token', () => {
        expect(localStorage.setItem).toBeCalledWith('access_token', authResult.accessToken)
      })

      it('Sets ID token', () => {
        expect(localStorage.setItem).toBeCalledWith('id_token', authResult.idToken)
      })

      it('Sets expires at', () => {
        expect(localStorage.setItem).toBeCalledWith('expires_at', JSON.stringify(now.getTime() + authResult.expiresIn * 1000))
      })
    })
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

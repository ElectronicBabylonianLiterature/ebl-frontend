import SessionStore from './SessionStore'
import Session from './Session'

const session = new Session('accessToken', 'idToken', 123, ['scope'])
const localStorageItems: Map<string, string> = new Map([
  ['access_token', session.accessToken],
  ['id_token', session.idToken],
  ['expires_at', JSON.stringify(session.expiresAt)],
  ['scopes', session.scopes.join(' ')],
])
const sessionStore = new SessionStore()

describe('saveSession', () => {
  beforeEach(() => sessionStore.setSession(session))

  for (const [key, value] of localStorageItems) {
    it(`Sets ${key} in local storage`, () => {
      expect(localStorage.getItem(key)).toEqual(value)
    })
  }
})

describe('clearSession', () => {
  beforeEach(() => {
    setItems()
    sessionStore.clearSession()
  })

  for (const [key] of localStorageItems) {
    it(`Removes ${key} from local storage`, () => {
      expect(localStorage.getItem(key)).toBeNull()
    })
  }
})

describe('getSession', () => {
  it('Returns session if token exists', () => {
    setItems()
    expect(sessionStore.getSession()).toEqual(session)
  })

  it('Returns null session if token does not exist', () => {
    expect(sessionStore.getSession()).toEqual(new Session('', '', 0, []))
  })
})

function setItems(): void {
  for (const [key, value] of localStorageItems) {
    localStorage.setItem(key, value)
  }
}

import Session from './Session'

class SessionStore {
  setSession(session) {
    localStorage.setItem('access_token', session.accessToken)
    localStorage.setItem('id_token', session.idToken)
    localStorage.setItem('expires_at', JSON.stringify(session.expiresAt))
    localStorage.setItem('scopes', session.scopes.join(' '))
  }

  clearSession() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('scopes')
  }

  getSession() {
    const expiresAt = localStorage.getItem('expires_at')
    const scopes = localStorage.getItem('scopes')
    return new Session(
      localStorage.getItem('access_token') || '',
      localStorage.getItem('id_token') || '',
      expiresAt ? JSON.parse(expiresAt) : 0,
      scopes ? scopes.split(' ') : []
    )
  }
}

export default SessionStore

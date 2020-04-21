import MemorySession, { Session } from 'auth/Session'

class SessionStore {
  setSession(session: MemorySession): void {
    localStorage.setItem('access_token', session.accessToken)
    localStorage.setItem('id_token', session.idToken)
    localStorage.setItem('expires_at', JSON.stringify(session.expiresAt))
    localStorage.setItem('scopes', session.scopes.join(' '))
  }

  clearSession(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('scopes')
  }

  getSession(): Session {
    const expiresAt = localStorage.getItem('expires_at')
    const scopes = localStorage.getItem('scopes')
    return new MemorySession(
      localStorage.getItem('access_token') || '',
      localStorage.getItem('id_token') || '',
      expiresAt ? JSON.parse(expiresAt) : 0,
      scopes ? scopes.split(' ') : []
    )
  }
}

export default SessionStore

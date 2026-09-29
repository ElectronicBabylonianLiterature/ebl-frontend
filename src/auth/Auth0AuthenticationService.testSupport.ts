import { Session, guestSession } from 'auth/Session'
import { User } from 'auth/Auth'

export const returnTo = 'http://localhost'
export const testUser: User = { name: 'Test User' }
export const testSession: Session = guestSession

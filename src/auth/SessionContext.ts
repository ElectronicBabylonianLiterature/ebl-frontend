import React, { Context } from 'react'
import { guestSession, Session } from 'auth/Session'

const SessionContext: Context<Session> =
  React.createContext<Session>(guestSession)

export default SessionContext

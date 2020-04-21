import React, { Context } from 'react'
import MemorySession, { Session } from './Session'

const SessionContext: Context<Session> = React.createContext<Session>(
  new MemorySession('', '', 0, [])
)

export default SessionContext

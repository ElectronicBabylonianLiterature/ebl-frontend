import React from 'react'
import Session from './Session'

const SessionContext = React.createContext(new Session('', '', 0, []))

export default SessionContext

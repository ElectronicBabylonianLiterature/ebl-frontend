import React, { useContext } from 'react'
import { LineGroup } from './LineGroup'

export const LineGroupContext = React.createContext<LineGroup | null>(null)

export function useLineGroupContext(): LineGroup {
  const lineGroup = useContext(LineGroupContext)
  if (lineGroup === null) {
    throw new Error(
      'useLineGroupContext must be inside LineGroupContext.Provider'
    )
  } else {
    return lineGroup
  }
}

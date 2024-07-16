import { Session } from 'auth/Session'
import React, { useState } from 'react'
import applicationScopes from 'auth/applicationScopes.json'
interface ScopeEditorProps {
  updateScopes: (scopes: string) => void
  session: Session
}

const ScopeEditor: React.FC<ScopeEditorProps> = ({ updateScopes, session }) => {
  const fragmentScopeRegex = /^read[A-Z][a-zA-Z]*Fragments$/
  const fragmentScopes = Object.fromEntries(
    Object.entries(applicationScopes).filter(([key, value]) =>
      fragmentScopeRegex.test(key)
    )
  )

  const [scopes, setScopes] = useState(() => {
    const initialScopes: { [key: string]: boolean } = {}
    Object.keys(fragmentScopes).forEach((scope) => {
      initialScopes[scope] = true
      // initialScopes[scope] = session.has(scope)
    })
    return initialScopes
  })

  const handleCheckboxChange = (scope: string) => {
    setScopes((prevScopes) => {
      const newScopes = { ...prevScopes, [scope]: !prevScopes[scope] }
      updateScopes(
        Object.keys(newScopes)
          .filter((key) => newScopes[key])
          .join(',')
      )
      return newScopes
    })
  }

  return (
    <div>
      {Object.keys(scopes).map((scope) => (
        <div key={scope}>
          <label>
            <input
              type="checkbox"
              checked={scopes[scope]}
              onChange={() => handleCheckboxChange(scope)}
            />
            {scope}
          </label>
        </div>
      ))}
    </div>
  )
}

export default ScopeEditor

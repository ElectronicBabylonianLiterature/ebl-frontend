import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Session } from 'auth/Session'

interface ScopeEditorProps {
  fragment: Fragment
  session: Session
  updateScopes: (scopes: string) => void
}

const ScopeEditor: React.FC<ScopeEditorProps> = ({
  fragment,
  updateScopes,
}) => {
  return (
    <div>
      <h3>Authorized Scopes</h3>
      <ul>
        {fragment.authorizedScopes?.map((scope) => (
          <li key={scope}>{scope}</li>
        ))}
      </ul>
    </div>
  )
}

export default ScopeEditor

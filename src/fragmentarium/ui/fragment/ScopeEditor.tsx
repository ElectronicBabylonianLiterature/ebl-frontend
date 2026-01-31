import React, { useState, useEffect } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import MemorySession, { Session } from 'auth/Session'
import { Button } from 'react-bootstrap'
interface ScopeEditorProps {
  fragment: Fragment
  session: Session
  updateScopes: (scopes: string[]) => Promise<void>
}

function isMemorySession(session: Session): session is MemorySession {
  return !session.isGuestSession()
}

const ScopeEditor: React.FC<ScopeEditorProps> = ({
  fragment,
  session,
  updateScopes,
}) => {
  const SCOPES = [
    'CAIC',
    'ItalianNineveh',
    'SipparLibrary',
    'UrukLBU',
    'SipparIstanbul',
    'Copenhagen',
  ]
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    fragment.authorizedScopes || [],
  )
  const [fragmentScopes, setFragmentScopes] = useState<string[]>([])
  useEffect(() => {
    if (isMemorySession(session)) {
      const scopes = SCOPES.filter((scope) =>
        session.hasApplicationScope('read' + scope + 'Fragments'),
      )
      const upperCaseScopes = scopes.map((scope) => scope.toUpperCase())
      const reformattedScopes = upperCaseScopes.map(
        (scope) => 'read:' + scope + '-fragments',
      )
      setFragmentScopes(reformattedScopes)
    }
  }, [session])
  const handleScopeChange = (scope: string) => {
    setSelectedScopes((prevScopes) =>
      prevScopes.includes(scope)
        ? prevScopes.filter((s) => s !== scope)
        : [...prevScopes, scope],
    )
  }

  const handleSubmit = async () => {
    await updateScopes(selectedScopes)
  }
  const getDisplayScope = (scope: string) => {
    return scope.replace('read:', '').replace('-fragments', '')
  }
  return (
    <div>
      <h3>Permissions</h3>
      <p>
        Records with added permissions are visible only to users who have those
        permissions.
      </p>
      {fragmentScopes.map((scope) => (
        <div key={scope}>
          <label>
            <input
              type="checkbox"
              checked={selectedScopes.includes(scope)}
              onChange={() => handleScopeChange(scope)}
            />
            Restrict it to users with {getDisplayScope(scope)} permissions
          </label>
        </div>
      ))}
      <Button onClick={handleSubmit}>Update Permissions</Button>
    </div>
  )
}
export default ScopeEditor

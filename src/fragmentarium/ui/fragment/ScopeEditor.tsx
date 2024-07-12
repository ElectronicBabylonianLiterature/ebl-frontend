import { Session } from 'auth/Session'
import React, { useState } from 'react'

interface ScopeEditorProps {
  updateScopes: (scopes: string) => void
  session: Session
}

const ScopeEditor: React.FC<ScopeEditorProps> = ({ updateScopes, session }) => {
  const [scopes, setScopes] = useState({
    readWords: session.isAllowedToReadWords(),
    writeWords: session.isAllowedToWriteWords(),
    readFragments: session.isAllowedToReadFragments(),
    transliterateFragments: session.isAllowedToTransliterateFragments(),
    lemmatizeFragments: session.isAllowedToLemmatizeFragments(),
    annotateFragments: session.isAllowedToAnnotateFragments(),
    readBibliography: session.isAllowedToReadBibliography(),
    writeBibliography: session.isAllowedToWriteBibliography(),
    readTexts: session.isAllowedToReadTexts(),
    writeTexts: session.isAllowedToWriteTexts(),
    accessBeta: session.hasBetaAccess(),
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

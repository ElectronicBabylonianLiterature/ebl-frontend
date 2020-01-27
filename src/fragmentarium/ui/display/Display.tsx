import React from 'react'
import TransliterationHeader from 'fragmentarium/ui/view/TransliterationHeader'
import SessionContext from 'auth/SessionContext'
import Session from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Glossary } from './Glossary'

import './Display.css'

interface Props {
  fragment: Fragment
}

function Display({ fragment }: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      <ol className="Display__lines">
        {fragment.atf.split('\n').map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
      <SessionContext.Consumer>
        {(session: Session): React.ReactNode =>
          session.hasBetaAccess() && <Glossary fragment={fragment} />
        }
      </SessionContext.Consumer>
    </>
  )
}

export default Display

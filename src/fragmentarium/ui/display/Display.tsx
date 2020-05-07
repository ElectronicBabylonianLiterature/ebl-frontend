import React from 'react'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Glossary } from './Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'

interface Props {
  fragment: Fragment
}

function Display({ fragment }: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      <Transliteration lines={fragment.text.lines} />
      <SessionContext.Consumer>
        {(session: Session): React.ReactNode =>
          session.hasBetaAccess() && <Glossary fragment={fragment} />
        }
      </SessionContext.Consumer>
    </>
  )
}

export default Display

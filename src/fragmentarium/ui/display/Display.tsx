import React from 'react'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'

interface Props {
  fragment: Fragment
  wordService: WordService
}

function Display({ fragment, wordService }: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      <Transliteration text={fragment.text} />
      <SessionContext.Consumer>
        {(session: Session): React.ReactNode =>
          session.hasBetaAccess() && (
            <Glossary text={fragment.text} wordService={wordService} />
          )
        }
      </SessionContext.Consumer>
    </>
  )
}

export default Display

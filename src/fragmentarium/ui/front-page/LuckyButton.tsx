import React, { ReactNode } from 'react'
import SessionContext from 'auth/SessionContext'
import FragmentButton from 'fragmentarium/ui/FragmentButton'
import Session from 'auth/Session'

export default function LuckyButton({ fragmentSearchService }): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToReadFragments() && (
          <FragmentButton query={() => fragmentSearchService.random()}>
            I&apos;m feeling lucky
          </FragmentButton>
        )
      }
    </SessionContext.Consumer>
  )
}

import React from 'react'
import SessionContext from 'auth/SessionContext'
import FragmentButton from './FragmentButton'

export default function LuckyButton({ fragmentSearchService }) {
  return (
    <SessionContext.Consumer>
      {session =>
        session.isAllowedToReadFragments() && (
          <FragmentButton query={() => fragmentSearchService.random()}>
            I'm feeling lucky
          </FragmentButton>
        )
      }
    </SessionContext.Consumer>
  )
}

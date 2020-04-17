import React from 'react'
import SessionContext from 'auth/SessionContext'
import FragmentButton from './FragmentButton'

export default function PioneersButton({ fragmentSearchService }) {
  return (
    <SessionContext.Consumer>
      {(session) =>
        session.isAllowedToTransliterateFragments() && (
          <FragmentButton query={() => fragmentSearchService.interesting()}>
            Path of the Pioneers
          </FragmentButton>
        )
      }
    </SessionContext.Consumer>
  )
}

import React from 'react'
import SessionContext from 'auth/SessionContext'
import RandomButton from './RandomButton'

export default function PioneersButton({ fragmentSearchService }) {
  return (
    <SessionContext.Consumer>
      {session =>
        session.isAllowedToTransliterateFragments() && (
          <RandomButton
            fragmentSearchService={fragmentSearchService}
            method="interesting"
          >
            Path of the Pioneers
          </RandomButton>
        )
      }
    </SessionContext.Consumer>
  )
}

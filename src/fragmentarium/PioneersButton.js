import React from 'react'
import SessionContext from 'auth/SessionContext'
import RandomButton from './RandomButton'

export default function PioneersButton ({ fragmentService }) {
  return (
    <SessionContext.Consumer>
      {session =>
        session.isAllowedToTransliterateFragments() && (
          <RandomButton fragmentService={fragmentService} method='interesting'>
            Path of the Pioneers
          </RandomButton>
        )
      }
    </SessionContext.Consumer>
  )
}

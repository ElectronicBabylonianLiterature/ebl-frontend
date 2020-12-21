import React from 'react'
import SessionContext from 'auth/SessionContext'
import FragmentButton from './FragmentButton'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

export default function PioneersButton({
  fragmentSearchService,
}: {
  fragmentSearchService: FragmentSearchService
}): JSX.Element {
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

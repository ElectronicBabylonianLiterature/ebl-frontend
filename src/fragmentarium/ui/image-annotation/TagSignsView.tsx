import React, { ReactNode } from 'react'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import Annotator from 'fragmentarium/ui/image-annotation/Annotator'
import { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import SignService from 'signs/application/SignService'

export default function TagSignsView({
  signService,
  fragmentService,
  number,
}: {
  signService: SignService
  fragmentService: FragmentService
  number: string
}): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Library'),
        new FragmentCrumb(number),
        new TextCrumb('Tag Signs'),
      ]}
      wide
    >
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToReadFragments() ? (
            <Annotator
              number={number}
              fragmentService={fragmentService}
              signService={signService}
            />
          ) : (
            'Please log in to tag signs.'
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

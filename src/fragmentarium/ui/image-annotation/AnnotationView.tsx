import React, { ReactNode } from 'react'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import Annotator from './Annotator'
import Session from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'

export default function AnnotationView({
  fragmentService,
  number
}: {
  fragmentService: FragmentService
  number: string
}): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Fragmentarium'),
        new TextCrumb(number),
        new TextCrumb('Annotate')
      ]}
      title={`Annotate ${number}`}
      wide
    >
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToReadFragments() ? (
            <Annotator number={number} fragmentService={fragmentService} />
          ) : (
            'Please log in to annotate Fragments.'
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

import React, { ReactNode } from 'react'

import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import Annotator from './Annotator'
import { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import { Container } from 'react-bootstrap'
import FragmentPager from 'fragmentarium/ui/fragment/FragmentPager'

const createAnnotationUrl = (number: string): string => {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  return `/fragmentarium/${encodeURIComponent(
    encodeURIComponent(number)
  )}/annotate`
}

export default function TagSignsView({
  fragmentService,
  number,
}: {
  fragmentService: FragmentService
  number: string
}): JSX.Element {
  return (
    <Container>
      <AppContent
        crumbs={[
          new SectionCrumb('Fragmentarium'),
          new FragmentCrumb(number),
          new TextCrumb('Tag signs'),
        ]}
        title={
          <FragmentPager
            createUrl={createAnnotationUrl}
            fragmentNumber={number}
            fragmentService={fragmentService}
          />
        }
        wide
      >
        <SessionContext.Consumer>
          {(session: Session): ReactNode =>
            session.isAllowedToReadFragments() ? (
              <Annotator number={number} fragmentService={fragmentService} />
            ) : (
              'Please log in to tag signs.'
            )
          }
        </SessionContext.Consumer>
      </AppContent>
    </Container>
  )
}

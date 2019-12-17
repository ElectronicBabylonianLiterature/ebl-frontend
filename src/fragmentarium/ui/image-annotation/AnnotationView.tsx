import React, { ReactNode } from 'react'

import AppContent from 'common/AppContent'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotator from './Annotator'
import Session from 'auth/Session'

type Props = {
  fragmentService
}
const FragmentWithData = withData<Props, { number: string }, Fragment>(
  ({ data, ...props }) => <Annotator fragment={data} {...props} />,
  props => props.fragmentService.find(props.number),
  {
    watch: props => [props.number]
  }
)

export default function AnnotationView({
  fragmentService,
  number
}: {
  fragmentService
  number
}) {
  return (
    <AppContent
      crumbs={['Fragmentarium', number]}
      title={`Annotate ${number}`}
      wide
    >
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToReadFragments() ? (
            <FragmentWithData
              number={number}
              fragmentService={fragmentService}
            />
          ) : (
            'Please log in to annotate Fragments.'
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

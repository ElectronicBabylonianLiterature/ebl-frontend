import React, { ReactNode } from 'react'
import SessionContext from 'auth/SessionContext'
import SimpleFragmentView from 'fragmentarium/ui/fragment/SimpleFragmentView'
import { Route } from 'react-router-dom'
import Services from 'router/Services'

export default function FullPageRoutes(services: Services): JSX.Element[] {
  return [
    <Route
      key="SimpleFragmentView"
      path="/library/:id/html"
      exact
      render={({ match }): ReactNode => (
        <SessionContext.Consumer>
          {(session) => (
            <SimpleFragmentView
              fragmentService={services.fragmentService}
              session={session}
              number={decodeURIComponent(match.params.id)}
            />
          )}
        </SessionContext.Consumer>
      )}
    />,
  ]
}

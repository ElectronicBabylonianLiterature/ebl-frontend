import React from 'react'
import { Redirect } from 'react-router-dom'
import Spinner from 'common/Spinner'
import ErrorReporterContext from 'ErrorReporterContext'

const redirectTarget = '/'

function Callback({ location, history, auth }) {
  return (
    <ErrorReporterContext.Consumer>
      {errorReporter => {
        if (/access_token|id_token|error/.test(location.hash)) {
          handleAuthentication(auth, history, errorReporter)
          return <Spinner />
        } else {
          return <Redirect to={redirectTarget} />
        }
      }}
    </ErrorReporterContext.Consumer>
  )
}

export default Callback
function handleAuthentication(auth, history, errorReporter) {
  auth
    .handleAuthentication()
    .then(() => history.replace(redirectTarget))
    .catch(error => {
      errorReporter.captureException(error)
      history.replace(redirectTarget)
    })
}

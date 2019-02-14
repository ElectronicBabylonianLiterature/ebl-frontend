
import React from 'react'
import { Redirect } from 'react-router-dom'
import Spinner from 'common/Spinner'
import ErrorReporterContext from 'ErrorReporterContext'

const redirectTarget = '/'

function Callback ({ location, history, auth }) {
  return <ErrorReporterContext.Consumer>
    { errorReporter => {
      if (/access_token|id_token|error/.test(location.hash)) {
        auth.handleAuthentication()
          .then(() => history.replace(redirectTarget))
          .catch(error => {
            errorReporter.captureException(error)
            history.replace(redirectTarget)
          })
        return <Spinner />
      } else {
        return <Redirect to={redirectTarget} />
      }
    }
    }
  </ErrorReporterContext.Consumer>
}

export default Callback

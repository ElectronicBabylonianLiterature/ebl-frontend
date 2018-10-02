/* global Raven */
import React from 'react'
import { Redirect } from 'react-router-dom'
import Spinner from 'common/Spinner'

const redirectTarget = '/'

function Callback ({ location, history, auth }) {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication()
      .then(() => history.replace(redirectTarget))
      .catch(error => {
        Raven.captureException(error)
        history.replace(redirectTarget)
      })
    return <Spinner />
  } else {
    return <Redirect to={redirectTarget} />
  }
}

export default Callback

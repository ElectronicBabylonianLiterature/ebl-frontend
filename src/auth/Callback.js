import React from 'react'
import Spinner from 'Spinner'

function Callback ({ location, history, auth }) {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication()
      .then(() => history.replace('/'))
      .catch(() => history.replace('/'))
  }

  return <Spinner />
}

export default Callback

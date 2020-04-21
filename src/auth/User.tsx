import React from 'react'
import { Button } from 'react-bootstrap'
import { useAuth0 } from './react-auth0-spa'
import { AuthenticationService, eblNameProperty } from './Auth'

function User(): JSX.Element {
  const auth0: AuthenticationService = useAuth0()
  return auth0.isAuthenticated() ? (
    <Button
      size="sm"
      variant="outline-secondary"
      onClick={(): void => auth0.logout()}
    >
      Logout {auth0.getUser()?.[eblNameProperty] || auth0.getUser()?.name}
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline-secondary"
      onClick={(): void => auth0.login()}
    >
      Login
    </Button>
  )
}

export default User

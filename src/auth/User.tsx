import React from 'react'
import { Button } from 'react-bootstrap'
import {
  AuthenticationService,
  eblNameProperty,
  useAuthentication,
} from './Auth'

interface Props {
  authenticationService: AuthenticationService
}

function LoginButton({ authenticationService }: Props): JSX.Element {
  return (
    <Button
      size="sm"
      variant="outline-secondary"
      onClick={(): void => authenticationService.login()}
    >
      Login
    </Button>
  )
}

function LogoutButton({ authenticationService }: Props): JSX.Element {
  const user = authenticationService.getUser()
  return (
    <Button
      size="sm"
      variant="outline-secondary"
      onClick={() => authenticationService.logout()}
    >
      Logout {user[eblNameProperty] ?? user.name}
    </Button>
  )
}

function User(): JSX.Element {
  const authenticationService: AuthenticationService = useAuthentication()
  return authenticationService.isAuthenticated() ? (
    <LogoutButton authenticationService={authenticationService} />
  ) : (
    <LoginButton authenticationService={authenticationService} />
  )
}

export default User

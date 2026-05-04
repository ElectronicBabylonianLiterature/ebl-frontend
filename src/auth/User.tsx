import React from 'react'
import { Button } from 'react-bootstrap'
import {
  AuthenticationService,
  eblNameProperty,
  useAuthentication,
} from 'auth/Auth'
import 'auth/User.sass'

interface Props {
  authenticationService: AuthenticationService
}

function GuestIcon(): JSX.Element {
  return (
    <svg
      className="AuthButton__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  )
}

function AuthenticatedIcon(): JSX.Element {
  return (
    <svg
      className="AuthButton__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21a6 6 0 0 1 12 0" />
      <path d="M16 11l2 2 4-4" />
    </svg>
  )
}

function AuthButton({
  authenticationService,
  label,
  isAuthenticated,
}: Props & {
  label: string
  isAuthenticated: boolean
}): JSX.Element {
  const handleClick = (): void => {
    if (isAuthenticated) {
      void authenticationService.logout()
    } else {
      authenticationService.login()
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline-secondary"
      className={`AuthButton ${
        isAuthenticated ? 'AuthButton--authenticated' : 'AuthButton--guest'
      }`}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      {isAuthenticated ? <AuthenticatedIcon /> : <GuestIcon />}
    </Button>
  )
}

function LoginButton({ authenticationService }: Props): JSX.Element {
  return (
    <AuthButton
      authenticationService={authenticationService}
      label="Login"
      isAuthenticated={false}
    />
  )
}

function LogoutButton({ authenticationService }: Props): JSX.Element {
  const user = authenticationService.getUser()
  const label = `Logout ${user[eblNameProperty] ?? user.name ?? 'User'}`
  return (
    <AuthButton
      authenticationService={authenticationService}
      label={label}
      isAuthenticated={true}
    />
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

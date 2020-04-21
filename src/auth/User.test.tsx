import React from 'react'
import { render, fireEvent, RenderResult } from '@testing-library/react'
import User from './User'
import {
  AuthenticationContext,
  AuthenticationService,
  User as EblUser,
} from './Auth'
import { Session } from 'auth/Session'

let auth: AuthenticationService
let isAuthenticatedMock: jest.Mock<boolean>

beforeEach(() => {
  isAuthenticatedMock = jest.fn()
  auth = {
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: isAuthenticatedMock,
    getUser: (): EblUser => ({
      name: 'Test User',
    }),
    getSession: (): Session => {
      throw new Error('Not implemented.')
    },
    getAccessToken: (): Promise<string> => {
      throw new Error('Not implemented.')
    },
  }
})

it('Calls Auth0 logout if user is logged in', () => {
  const { getByText } = renderUser(true)
  fireEvent.click(getByText('Logout Test User'))
  expect(auth.logout).toHaveBeenCalled()
})

it('Calls Auth0 login if user is logged out', () => {
  const { getByText } = renderUser(false)
  fireEvent.click(getByText('Login'))
  expect(auth.login).toHaveBeenCalled()
})

function renderUser(isAuthenticated: boolean): RenderResult {
  isAuthenticatedMock.mockReturnValueOnce(isAuthenticated)
  return render(
    <AuthenticationContext.Provider value={auth}>
      <User />
    </AuthenticationContext.Provider>
  )
}

import React from 'react'
import { render, fireEvent, RenderResult } from '@testing-library/react'
import User from './User'
import { AuthenticationService } from './Auth'
import { Auth0Context } from './react-auth0-spa'

let auth

beforeEach(() => {
  auth = {
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getUser: () => ({
      name: 'Test User',
    }),
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
  auth.isAuthenticated.mockReturnValueOnce(isAuthenticated)
  return render(
    <Auth0Context.Provider value={auth}>
      <User />
    </Auth0Context.Provider>
  )
}

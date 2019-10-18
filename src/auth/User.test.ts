import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import User from './User'

let auth

beforeEach(() => {
  auth = {
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

it('Calls Auth0 logout if user is logged in', () => {
  const { getByText } = renderUser(true)
  fireEvent.click(getByText('Logout'))
  expect(auth.logout).toHaveBeenCalled()
})

it('Calls Auth0 login if user is logged out', () => {
  const { getByText } = renderUser(false)
  fireEvent.click(getByText('Login'))
  expect(auth.login).toHaveBeenCalled()
})

function renderUser(isAuthenticated) {
  auth.isAuthenticated.mockReturnValueOnce(isAuthenticated)
  return render(<User auth={auth} />)
}

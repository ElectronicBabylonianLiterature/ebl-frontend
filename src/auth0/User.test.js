import React from 'react'
import { render, fireEvent, cleanup } from 'react-testing-library'
import User from './User'

let auth

afterEach(cleanup)

beforeEach(() => {
  auth = {
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

describe('Logging out', () => {
  beforeEach(async () => {
    auth.isAuthenticated.mockReturnValueOnce(true)
    const {getByText} = render(<User auth={auth} />)
    fireEvent.click(getByText('Logout'))
  })

  it('Calls Auth0 logout', () => {
    expect(auth.logout).toHaveBeenCalled()
  })
})

describe('Logging in', () => {
  beforeEach(() => {
    auth.isAuthenticated.mockReturnValueOnce(false)
    const {getByText} = render(<User auth={auth} />)
    fireEvent.click(getByText('Login'))
  })

  it('Calls Auth0 login', () => {
    expect(auth.login).toHaveBeenCalled()
  })
})

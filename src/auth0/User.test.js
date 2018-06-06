import React from 'react'
import { MemoryRouter, Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import {render, Simulate} from 'react-testing-library'
import User from './User'

let auth

beforeEach(() => {
  auth = {
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

describe('Logging out', () => {
  let history

  beforeEach(() => {
    history = createMemoryHistory()
    jest.spyOn(history, 'replace')
    auth.isAuthenticated.mockReturnValueOnce(true)
    const {getByText} = render(<Router history={history}><User auth={auth} /></Router>)
    Simulate.click(getByText('Logout'))
  })

  it('Calls Auth0 logout', () => {
    expect(auth.logout).toHaveBeenCalled()
  })

  it('Replaces history with /', () => {
    expect(history.replace).toBeCalledWith('/')
  })
})

describe('Logging in', () => {
  beforeEach(() => {
    auth.isAuthenticated.mockReturnValueOnce(false)
    const {getByText} = render(<MemoryRouter><User auth={auth} /></MemoryRouter>)
    Simulate.click(getByText('Login'))
  })

  it('Calls Auth0 login', () => {
    expect(auth.login).toHaveBeenCalled()
  })
})

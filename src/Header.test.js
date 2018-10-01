import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'
import Auth from './auth/Auth'

let auth
let element

beforeEach(() => {
  auth = new Auth()
})

describe('Logged out', () => {
  beforeEach(() => renderHeader(false))

  commonTests()

  it('Has login button', () => {
    expect(element.getByText('Login')).toBeVisible()
  })
})

describe('Logged in', () => {
  beforeEach(() => renderHeader(true))

  commonTests()

  it('Has logout button', () => {
    expect(element.getByText('Logout')).toBeVisible()
  })
})

function commonTests () {
  it('Navigation has Home link', () => {
    expect(element.getByText('Home')).toHaveAttribute('href', '/')
  })

  it('Navigation has Dictionary link', () => {
    expect(element.getByText('Dictionary')).toHaveAttribute('href', '/dictionary')
  })

  it('Navigation has Fragmentarium link', () => {
    expect(element.getByText('Fragmentarium')).toHaveAttribute('href', '/fragmentarium')
  })
}

function renderHeader (loggedIn) {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(loggedIn)
  element = render(<MemoryRouter><Header auth={auth} /></MemoryRouter>)
}

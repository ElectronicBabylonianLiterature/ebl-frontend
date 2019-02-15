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

  test('Login button', () => {
    expect(element.getByText('Login')).toBeVisible()
  })
})

describe('Logged in', () => {
  beforeEach(() => renderHeader(true))

  commonTests()

  test('Logout button', () => {
    expect(element.getByText('Logout')).toBeVisible()
  })
})

function commonTests () {
  test.each([
    ['Home', '/'],
    ['Dictionary', '/dictionary'],
    ['Fragmentarium', '/fragmentarium'],
    ['Bibliography', '/bibliography']
  ])('%s links to %s', (title, href) => {
    expect(element.getByText(title)).toHaveAttribute('href', href)
  })
}

function renderHeader (loggedIn) {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(loggedIn)
  element = render(<MemoryRouter><Header auth={auth} /></MemoryRouter>)
}

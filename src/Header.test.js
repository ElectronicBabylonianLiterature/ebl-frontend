import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'

let auth
let element

beforeEach(() => {
  auth = {
    isAuthenticated: jest.fn()
  }
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
  test('Logo links to home', () => {
    expect(
      element.getByTitle('electronic Babylonian Literature (eBL)')
    ).toHaveAttribute('href', '/')
  })

  test.each([
    ['Dictionary', '/dictionary'],
    ['Fragmentarium', '/fragmentarium'],
    ['Bibliography', '/bibliography']
  ])('%s links to %s', (title, href) => {
    expect(element.getByText(title)).toHaveAttribute('href', href)
  })
}

function renderHeader (loggedIn) {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(loggedIn)
  element = render(
    <MemoryRouter>
      <Header auth={auth} />
    </MemoryRouter>
  )
}

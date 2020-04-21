import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'
import { Auth0Context } from './auth/react-auth0-spa'

let auth

beforeEach(() => {
  auth = {
    isAuthenticated: jest.fn(),
    getUser: () => ({ name: 'Test User' }),
  }
})

describe('Logged out', () => {
  beforeEach(() => renderHeader(false))

  commonTests()

  test('Login button', () => {
    expect(screen.getByText('Login')).toBeVisible()
  })
})

describe('Logged in', () => {
  beforeEach(() => renderHeader(true))

  commonTests()

  test('Logout button', () => {
    expect(screen.getByText('Logout Test User')).toBeVisible()
  })
})

function commonTests(): void {
  test('Logo links to home', () => {
    expect(
      screen.getByTitle('electronic Babylonian Literature (eBL)')
    ).toHaveAttribute('href', '/')
  })

  test.each([
    ['Dictionary', '/dictionary'],
    ['Fragmentarium', '/fragmentarium'],
    ['Bibliography', '/bibliography'],
    ['Corpus', '/corpus'],
  ])('%s links to %s', (title, href) => {
    expect(screen.getByText(title)).toHaveAttribute('href', href)
  })
}

function renderHeader(loggedIn): void {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(loggedIn)
  render(
    <MemoryRouter>
      <Auth0Context.Provider value={auth}>
        <Header />
      </Auth0Context.Provider>
    </MemoryRouter>
  )
}

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'
import { AuthenticationContext, User } from 'auth/Auth'
import userEvent from '@testing-library/user-event'

let auth

beforeEach(() => {
  auth = {
    isAuthenticated: jest.fn(),
    getUser: (): User => ({ name: 'Test User' }),
  }
})

describe('Logged out', () => {
  beforeEach(async () => await renderHeader(false))

  commonTests()

  test('Login button', () => {
    expect(screen.getByText('Login')).toBeVisible()
  })
})

describe('Logged in', () => {
  beforeEach(async () => await renderHeader(true))

  commonTests()

  test('Logout button', async () => {
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
describe('Unfocus Header Labels on clicking ebl Logo', () => {
  beforeEach(async () => await renderHeader(true))

  test('click Logo', () => {
    userEvent.click(screen.getByText('Fragmentarium'))
    userEvent.click(screen.getByTitle('electronic Babylonian Literature (eBL)'))
    expect(screen.getByText('Fragmentarium')).not.toHaveClass('active')
    expect(screen.getByText('Fragmentarium')).not.toHaveFocus()
  })
})

async function renderHeader(loggedIn: boolean): Promise<void> {
  auth.isAuthenticated.mockReturnValue(loggedIn)
  await act(async () => {
    render(
      <MemoryRouter>
        <AuthenticationContext.Provider value={auth}>
          <Header />
        </AuthenticationContext.Provider>
      </MemoryRouter>
    )
  })
}

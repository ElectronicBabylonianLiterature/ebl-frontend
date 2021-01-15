import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Router } from 'react-router-dom'
import Header from './Header'
import { createMemoryHistory } from 'history'
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

  test('correct element becomes active when clicking link on the header', () => {
    userEvent.click(screen.getByText('Fragmentarium'))
    userEvent.click(screen.getByTitle('electronic Babylonian Literature (eBL)'))
    expectHeaderLabelNotActive('')
  })
})
describe('Correct element is active based on the route', () => {
  test('Logout button', async () => {
    await renderHeader(true, 'bibliography')
    expect(screen.getByText('Bibliography')).toHaveClass('active')
    expectHeaderLabelNotActive('Bibliography')
  })
  test('correct element becomes active when clicking link on the header after redirect', async () => {
    await renderHeader(true, 'bibliography')
    userEvent.click(screen.getByText('Fragmentarium'))
    expect(screen.getByText('Fragmentarium')).toHaveClass('active')
    expectHeaderLabelNotActive('Fragmentarium')
  })
})

function expectHeaderLabelNotActive(activeLabel: string): void {
  const allHeaderLabels = [
    'Fragmentarium',
    'Bibliography',
    'Dictionary',
    'Corpus',
  ]
  allHeaderLabels
    .filter((label) => label !== activeLabel)
    .map((label) => expect(screen.getByText(label)).not.toHaveClass('active'))
}

async function renderHeader(loggedIn: boolean, path?: string): Promise<void> {
  auth.isAuthenticated.mockReturnValue(loggedIn)
  const history = createMemoryHistory()
  {
    path && history.push(path)
  }
  await act(async () => {
    render(
      <Router history={history}>
        <AuthenticationContext.Provider value={auth}>
          <Header />
        </AuthenticationContext.Provider>
      </Router>
    )
  })
}

import React from 'react'
import { render, screen } from '@testing-library/react'
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
  const renderLoggedOut = () => renderHeader(false)

  commonTests(renderLoggedOut)

  test('Login button', async () => {
    await renderLoggedOut()
    expect(screen.getByText('Login')).toBeVisible()
  })
})

describe('Logged in', () => {
  const renderLoggedIn = () => renderHeader(true)

  commonTests(renderLoggedIn)

  test('Logout button', async () => {
    await renderLoggedIn()
    expect(screen.getByText('Logout Test User')).toBeVisible()
  })
})

function commonTests(renderHeader: () => Promise<void>): void {
  test('Logo links to home', async () => {
    await renderHeader()
    expect(
      screen.getByTitle('electronic Babylonian Library (eBL)'),
    ).toHaveAttribute('href', '/')
  })

  test.each([
    ['Signs', '/signs'],
    ['Dictionary', '/dictionary'],
    ['Library', '/library'],
    ['Bibliography', '/bibliography'],
    ['Corpus', '/corpus'],
    ['About', '/about'],
    ['Tools', '/tools'],
  ])('%s links to %s', async (title, href) => {
    await renderHeader()
    expect(screen.getByText(title)).toHaveAttribute('href', href)
  })
}
describe('Unfocus Header Labels on clicking ebl Logo', () => {
  test('correct element becomes active when clicking link on the header', async () => {
    await renderHeader(true)
    await userEvent.click(screen.getByText('Library'))
    await userEvent.click(
      screen.getByTitle('electronic Babylonian Library (eBL)'),
    )
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
    await userEvent.click(screen.getByText('Library'))
    expect(screen.getByText('Library')).toHaveClass('active')
    expectHeaderLabelNotActive('Library')
  })
})

function expectHeaderLabelNotActive(activeLabel: string): void {
  const allHeaderLabels = [
    'Signs',
    'Library',
    'Bibliography',
    'Dictionary',
    'Corpus',
    'About',
    'Tools',
  ]
  allHeaderLabels
    .filter((label) => label !== activeLabel)
    .map((label) => expect(screen.getByText(label)).not.toHaveClass('active'))
}

async function renderHeader(loggedIn: boolean, path?: string): Promise<void> {
  auth.isAuthenticated.mockReturnValue(loggedIn)

  render(
    <MemoryRouter>
      <AuthenticationContext.Provider value={auth}>
        <Header />
      </AuthenticationContext.Provider>
    </MemoryRouter>,
  )
}

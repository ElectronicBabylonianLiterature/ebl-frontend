import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Redirect } from 'router/compat'

function LocationDisplay(): JSX.Element {
  const location = useLocation()
  return (
    <span data-testid="location">
      {location.pathname}
      {location.search}
      {location.hash}
    </span>
  )
}

function renderRedirect(initialEntry: string, to: string): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Redirect exact from="/signs" to={to} />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

describe('Redirect', () => {
  it('preserves the current query string and hash', async () => {
    renderRedirect('/signs?listsName=MZL&listsNumber=1#result', '/tools/signs')

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/tools/signs?listsName=MZL&listsNumber=1#result',
      )
    })
  })

  it('keeps target query string and hash when they are explicit', async () => {
    renderRedirect(
      '/signs?listsName=MZL&listsNumber=1#result',
      '/tools/signs?value=ba#search',
    )

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/tools/signs?value=ba#search',
      )
    })
  })
})

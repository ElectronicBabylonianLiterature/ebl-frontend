import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapShareLink from 'map/MapShareLink'

function mockClipboard(writeText: jest.Mock): void {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
}

describe('MapShareLink', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    })
  })

  it('copies the current URL and reports success', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)

    render(<MapShareLink />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy map link' }))

    expect(writeText).toHaveBeenCalledWith(window.location.href)
    await waitFor(() => {
      expect(
        screen.getByText('Map link copied to clipboard.'),
      ).toBeInTheDocument()
    })
  })

  it('reports failure when the clipboard write is rejected', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'))
    mockClipboard(writeText)

    render(<MapShareLink />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy map link' }))

    await waitFor(() => {
      expect(
        screen.getByText('Copying failed. Copy the address bar URL instead.'),
      ).toBeInTheDocument()
    })
  })

  it('reports failure when the Clipboard API is unavailable', async () => {
    render(<MapShareLink />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy map link' }))

    await waitFor(() => {
      expect(
        screen.getByText('Copying failed. Copy the address bar URL instead.'),
      ).toBeInTheDocument()
    })
  })

  it('shows no status message before the button is used', () => {
    render(<MapShareLink />)

    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})

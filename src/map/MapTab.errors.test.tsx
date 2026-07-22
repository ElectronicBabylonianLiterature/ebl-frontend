import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  makeFragmentService,
  makeProvenance,
  resetMapMocks,
  triggerMapEvent,
} from './MapTab.testHelpers'
import MapTab from './MapTab'

describe('MapTab map errors', () => {
  beforeEach(resetMapMocks)

  it('shows a user-visible warning when the map background fails to load', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    const input = await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', {
        error: {
          message:
            'Failed to fetch https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        },
      })
    })

    expect(
      screen.getByText(
        'The map background could not be loaded. Check your connection and try again.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Interactive findspot map' }),
    ).toBeInTheDocument()

    await userEvent.type(input, 'Bab')
    expect(screen.getByRole('link', { name: 'Babylon' })).toBeInTheDocument()
  })

  it('ignores unrelated non-background map errors', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', {
        error: { message: 'WebGL context restored' },
      })
    })

    expect(
      screen.queryByText(/The map background could not be loaded/),
    ).not.toBeInTheDocument()
  })
  it('ignores map errors without a message', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', { error: {} })
    })

    expect(
      screen.queryByText(/The map background could not be loaded/),
    ).not.toBeInTheDocument()
  })
})

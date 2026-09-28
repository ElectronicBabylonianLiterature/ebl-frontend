import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import { MAP_STYLE_URL } from 'map/mapBackgroundError'
import useMapLayoutEffects from 'map/useMapLayoutEffects'

jest.mock('maplibre-gl')
jest.mock('map/useMapLayoutEffects')

const mockUseMapLayoutEffects = useMapLayoutEffects as jest.Mock

function lastActivePanel(): unknown {
  const calls = mockUseMapLayoutEffects.mock.calls
  return calls[calls.length - 1]?.[3]
}
describe('MapTab presentation mode', () => {
  beforeEach(() => {
    resetMapMocks()
    mockUseMapLayoutEffects.mockClear()
  })

  it('clears panel layout while the drawer is hidden', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))

    await userEvent.click(
      await screen.findByRole('button', { name: 'Map layers' }),
    )
    await waitFor(() => expect(lastActivePanel()).toBe('layers'))

    await userEvent.click(
      screen.getByRole('button', { name: 'Presentation mode' }),
    )

    await waitFor(() => expect(lastActivePanel()).toBeNull())
  })

  it('restores focus after button and keyboard exits', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))

    const enter = await screen.findByRole('button', {
      name: 'Presentation mode',
    })
    await userEvent.click(enter)
    expect(
      screen.getByRole('button', { name: 'Exit presentation mode' }),
    ).toHaveFocus()

    await userEvent.click(
      screen.getByRole('button', { name: 'Exit presentation mode' }),
    )
    expect(
      screen.getByRole('button', { name: 'Presentation mode' }),
    ).toHaveFocus()

    await userEvent.click(
      screen.getByRole('button', { name: 'Presentation mode' }),
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(
      screen.getByRole('button', { name: 'Presentation mode' }),
    ).toHaveFocus()
  })

  it('keeps an accurate accessible map description while presenting', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))

    await userEvent.click(
      await screen.findByRole('button', { name: 'Presentation mode' }),
    )

    const region = screen.getByRole('region', {
      name: 'Interactive findspot map',
    })
    const descriptionId = region.getAttribute('aria-describedby')
    expect(descriptionId).toBe('findspot-map-description')
    expect(
      screen.getByText('Interactive findspot map in presentation mode.'),
    ).toHaveAttribute('id', descriptionId)
    expect(
      screen.getByText('Interactive findspot map in presentation mode.'),
    ).toHaveClass('visually-hidden')
  })

  it('uses presentation-safe copy for a map background failure', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await userEvent.click(
      await screen.findByRole('button', { name: 'Presentation mode' }),
    )

    act(() => {
      triggerMapEvent('error', {
        error: { url: MAP_STYLE_URL, message: 'Not Found' },
      })
    })

    expect(
      screen.getByText('The interactive map could not be loaded.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Findspot links remain available below/),
    ).not.toBeInTheDocument()
  })
})

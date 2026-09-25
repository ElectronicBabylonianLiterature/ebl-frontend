import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  CURRENT_LOCATION_TEST_ID,
  deferMapLoad,
  makeFragmentService,
  makeProvenance,
  mockEaseTo,
  mockSetTerrain,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import { TERRAIN_SOURCE_ID } from 'map/mapTerrainLayers'

jest.mock('maplibre-gl')

describe('MapTab terrain interactions', () => {
  beforeEach(resetMapMocks)

  it('activates a URL-requested terrain view after deferred style load', async () => {
    deferMapLoad()
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&terrain=1',
    )

    expect(await screen.findByRole('button', { name: 'Terrain' })).toBeVisible()
    expect(mockSetTerrain).not.toHaveBeenCalled()

    act(() => triggerMapEvent('load'))

    await waitFor(() =>
      expect(mockSetTerrain).toHaveBeenCalledWith({
        source: TERRAIN_SOURCE_ID,
        exaggeration: 1.4,
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Terrain' }))
    expect(
      screen.getByRole('checkbox', { name: 'Modern elevation model' }),
    ).toBeChecked()
  })

  it('disables terrain and removes it from the URL', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&terrain=1',
    )
    await userEvent.click(
      await screen.findByRole('button', { name: 'Terrain' }),
    )
    const toggle = screen.getByRole('checkbox', {
      name: 'Modern elevation model',
    })
    await waitFor(() => expect(toggle).toBeChecked())

    await userEvent.click(toggle)

    await waitFor(() => expect(toggle).not.toBeChecked())
    expect(mockSetTerrain).toHaveBeenLastCalledWith(null)
    expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).not.toHaveTextContent(
      'terrain=1',
    )
  })

  it('reset clears terrain and restores a level north-up camera', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&terrain=1',
    )
    await waitFor(() => expect(mockSetTerrain).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'Reset view' }))

    await waitFor(() => expect(mockSetTerrain).toHaveBeenLastCalledWith(null))
    expect(mockEaseTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ pitch: 0, bearing: 0 }),
    )
    expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).not.toHaveTextContent(
      'terrain=1',
    )
  })
})

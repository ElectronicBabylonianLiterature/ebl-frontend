import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapTerrainPanel from 'map/MapTerrainPanel'
import { AWS_TERRAIN_TILES } from 'map/mapTerrainSource'
import type { MapTerrainResult } from 'map/useMapTerrain'

function terrain(overrides: Partial<MapTerrainResult> = {}): MapTerrainResult {
  return {
    isSupported: true,
    source: AWS_TERRAIN_TILES,
    exaggeration: 1.4,
    unavailableReason: null,
    isEnabled: false,
    status: 'off',
    errorMessage: null,
    ...overrides,
  }
}

describe('MapTerrainPanel', () => {
  it('checks the switch only when terrain is actually active', () => {
    const { rerender } = render(
      <MapTerrainPanel terrain={terrain()} onChange={jest.fn()} />,
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()

    rerender(
      <MapTerrainPanel
        terrain={terrain({ isEnabled: true, status: 'enabled' })}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('disables unsupported terrain and explains why', () => {
    render(
      <MapTerrainPanel
        terrain={terrain({
          isSupported: false,
          status: 'unavailable',
          unavailableReason: 'low-power-device',
        })}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('limited memory')
  })

  it('reports loading and runtime failure states truthfully', () => {
    const { rerender } = render(
      <MapTerrainPanel
        terrain={terrain({ status: 'loading' })}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading elevation')

    rerender(
      <MapTerrainPanel
        terrain={terrain({ status: 'error', errorMessage: 'Tile failure.' })}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Tile failure.')
  })

  it('lets the user enable or disable supported terrain', async () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <MapTerrainPanel terrain={terrain()} onChange={onChange} />,
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenLastCalledWith(true)

    rerender(
      <MapTerrainPanel
        terrain={terrain({ isEnabled: true, status: 'enabled' })}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenLastCalledWith(false)
  })
})

import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import type { MapMock } from '__mocks__/maplibre-gl'
import { renderMapTab } from 'test-support/map-render'
import {
  findspotMapData,
  polygonFeature,
  provenanceRecord,
} from 'test-support/map-fixtures'
import { TERRAIN_HILLSHADE_LAYER_ID } from './mapTerrainLayers'

const assur = provenanceRecord({ id: 'assur', longName: 'Aššur' })

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        type: 'FeatureCollection',
        features: [polygonFeature('assur-area-a-checksum', 'assur')],
      }),
  }) as unknown as typeof fetch
})

async function mountMapTab(): Promise<MapMock> {
  renderMapTab({ provenances: [assur], mapData: [findspotMapData()] })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  act(() => lastMapMock().emit('load'))
  return lastMapMock()
}

async function openTool(name: string): Promise<HTMLElement> {
  await userEvent.click(await screen.findByRole('button', { name }))
  return screen.getByRole('region', { name })
}

describe('the advanced tool bar', () => {
  it('offers only supported tools and opens one at a time', async () => {
    await mountMapTab()

    const bar = screen.getByRole('group', { name: 'Map tools' })
    expect(
      within(bar)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([
      'Explore',
      'Layers',
      'Visualize',
      'Compare',
      'Timeline',
      'Search area',
      'Measure',
      'Export',
      'Terrain',
    ])

    expect(screen.getByRole('region', { name: 'Explore' })).toBeVisible()

    await openTool('Measure')
    expect(
      screen.queryByRole('region', { name: 'Explore' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Measure' })).toBeVisible()

    await openTool('Export')
    expect(
      screen.queryByRole('region', { name: 'Measure' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Export' })).toBeVisible()
  })

  it('closes the open tool when its button is pressed again', async () => {
    await mountMapTab()
    const button = await screen.findByRole('button', { name: 'Export' })

    await userEvent.click(button)
    expect(screen.getByRole('region', { name: 'Export' })).toBeVisible()

    await userEvent.click(button)
    expect(
      screen.queryByRole('region', { name: 'Export' }),
    ).not.toBeInTheDocument()
  })
})

describe('the measurement tool', () => {
  it('measures a distance from map clicks and clears it', async () => {
    const map = await mountMapTab()
    const panel = await openTool('Measure')

    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Select points on the map to measure a distance.',
    )

    act(() => map.emit('click', { lngLat: { lng: 43.25, lat: 35.45 } }))
    act(() => map.emit('click', { lngLat: { lng: 43.26, lat: 35.45 } }))

    expect(within(panel).getByRole('status')).toHaveTextContent(/ m$/)

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Clear measurement' }),
    )
    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Select points on the map to measure a distance.',
    )
  })

  it('labels measurements as temporary rather than archaeological', async () => {
    await mountMapTab()
    await openTool('Measure')

    expect(
      screen.getByText(/Not an archaeological annotation/),
    ).toBeInTheDocument()
  })
})

describe('the spatial search tool', () => {
  it('searches the current viewport and links individual findspots', async () => {
    await mountMapTab()
    const panel = await openTool('Search area')

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Search current view' }),
    )

    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Current map view',
    )
    expect(
      screen.getByText(/not an exact findspot coordinate/),
    ).toBeInTheDocument()
  })

  it('collects two corners of a drawn rectangle', async () => {
    const map = await mountMapTab()
    const panel = await openTool('Search area')

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Draw a rectangle' }),
    )
    act(() => map.emit('click', { lngLat: { lng: 43.24, lat: 35.44 } }))
    act(() => map.emit('click', { lngLat: { lng: 43.27, lat: 35.47 } }))

    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Drawn rectangle',
    )

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Clear search' }),
    )
    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Search excavation areas by the current view or a drawn rectangle.',
    )
  })
})

describe('the export tool', () => {
  it('explains why image export is unavailable but keeps data export', async () => {
    await mountMapTab()
    await openTool('Export')

    expect(
      screen.getByRole('button', { name: 'Download GeoJSON' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Download CSV' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Download image' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/never include unrestricted fragment totals/),
    ).toBeInTheDocument()
  })
})

describe('the terrain tool', () => {
  it('states that elevation is modern and attributes the source', async () => {
    await mountMapTab()
    await openTool('Terrain')

    expect(
      screen.getByText(/not ancient ground level or excavated stratigraphy/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/courtesy of the U.S. Geological Survey/),
    ).toBeInTheDocument()
  })

  it('adds and removes the elevation source and hillshade', async () => {
    const map = await mountMapTab()
    await openTool('Terrain')

    const toggle = screen.getByLabelText('Modern elevation model')
    await userEvent.click(toggle)
    expect(map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)).toBeDefined()
    expect(map.setTerrain).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'ebl-terrain-dem' }),
    )

    await userEvent.click(toggle)
    expect(map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)).toBeUndefined()
    expect(map.setTerrain).toHaveBeenLastCalledWith(null)
  })
})

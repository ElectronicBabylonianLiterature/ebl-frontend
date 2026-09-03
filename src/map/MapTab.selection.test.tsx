import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import type { MapMock } from '__mocks__/maplibre-gl'
import { renderMapTab } from 'test-support/map-render'
import { findspotMapData, provenanceRecord } from 'test-support/map-fixtures'
import {
  excavationAreaFillLayer,
  unclusteredLayer,
  EXCAVATION_AREAS_SOURCE_ID,
  SOURCE_ID,
} from './mapLayers'
import { buildFindspotFragmentSearchLink } from './mapLinks'

const babylon = provenanceRecord()

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
  }) as unknown as typeof fetch
})

async function mountMapTab(mapData = [findspotMapData()]): Promise<MapMock> {
  renderMapTab({ provenances: [babylon], mapData })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  act(() => lastMapMock().emit('load'))
  return lastMapMock()
}

function clickAt(mapMock: MapMock): void {
  act(() => mapMock.emit('click', { point: { x: 5, y: 5 } }))
}

describe('map selection', () => {
  it('selects a site from the map and shows it in the inspector', async () => {
    const mapMock = await mountMapTab()
    mapMock.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [44.42, 32.542] },
              properties: { id: 'babylon', name: 'Babylon' },
            },
          ]
        : [],
    )

    clickAt(mapMock)

    expect(
      await screen.findByRole('heading', { name: 'Babylon' }),
    ).toBeInTheDocument()
    expect(
      mapMock.getFeatureState({ source: SOURCE_ID, id: 'babylon' }),
    ).toEqual({
      selected: true,
    })
  })

  it('selects an excavation area and links to its findspot fragments', async () => {
    const mapMock = await mountMapTab()
    mapMock.setRenderedFeatures((layers) =>
      layers.includes(excavationAreaFillLayer.id)
        ? [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [43.25, 35.45],
                    [43.26, 35.45],
                    [43.26, 35.46],
                    [43.25, 35.45],
                  ],
                ],
              },
              properties: { id: 'assur-area-a-checksum', name: 'Area A' },
            },
          ]
        : [],
    )

    clickAt(mapMock)

    expect(
      await screen.findByRole('heading', { name: 'Area A' }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
    expect(screen.getByText('Findspot 123')).toBeInTheDocument()
    expect(screen.getByText('4 accessible fragments')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /View fragments/ }),
    ).toHaveAttribute('href', buildFindspotFragmentSearchLink(123))
    expect(
      mapMock.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'assur-area-a-checksum',
      }),
    ).toEqual({
      accessibleFragmentCount: 4,
      findspotCount: 1,
      evidenceCode: 1,
      selected: true,
    })
  })

  it('takes two Escapes to close the inspector then clear the selection', async () => {
    const mapMock = await mountMapTab()
    mapMock.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [44.42, 32.542] },
              properties: { id: 'babylon', name: 'Babylon' },
            },
          ]
        : [],
    )
    clickAt(mapMock)
    await screen.findByRole('heading', { name: 'Babylon' })

    await userEvent.keyboard('{Escape}')

    expect(
      screen.queryByRole('heading', { name: 'Babylon' }),
    ).not.toBeInTheDocument()
    expect(
      mapMock.getFeatureState({ source: SOURCE_ID, id: 'babylon' }),
    ).toEqual({ selected: true })

    await userEvent.keyboard('{Escape}')

    expect(
      mapMock.getFeatureState({ source: SOURCE_ID, id: 'babylon' }),
    ).toEqual({ selected: false })
  })

  it('resets the view, closing the panel and re-centring the camera', async () => {
    const mapMock = await mountMapTab()
    mapMock.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [44.42, 32.542] },
              properties: { id: 'babylon', name: 'Babylon' },
            },
          ]
        : [],
    )
    clickAt(mapMock)
    await screen.findByRole('heading', { name: 'Babylon' })

    await userEvent.click(screen.getByRole('button', { name: 'Reset view' }))

    expect(
      screen.queryByRole('heading', { name: 'Babylon' }),
    ).not.toBeInTheDocument()
    expect(mapMock.easeTo).toHaveBeenLastCalledWith({
      center: [44.4, 33.0],
      zoom: 5,
    })
  })

  it('offers a pill to restore the inspector once a different panel is open', async () => {
    const mapMock = await mountMapTab()
    mapMock.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [44.42, 32.542] },
              properties: { id: 'babylon', name: 'Babylon' },
            },
          ]
        : [],
    )
    clickAt(mapMock)
    await screen.findByRole('heading', { name: 'Babylon' })

    expect(
      screen.queryByRole('button', { name: 'Show selected area' }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(
      screen.queryByRole('heading', { name: 'Babylon' }),
    ).not.toBeInTheDocument()
    const pill = screen.getByRole('button', { name: 'Show selected area' })

    await userEvent.click(pill)

    expect(
      await screen.findByRole('heading', { name: 'Babylon' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show selected area' }),
    ).not.toBeInTheDocument()
  })
})

describe('keyboard-accessible explorer', () => {
  it('selects a site from the semantic site list', async () => {
    await mountMapTab()

    await userEvent.click(screen.getByRole('button', { name: /Babylon/ }))

    expect(
      await screen.findByRole('heading', { name: 'Babylon' }),
    ).toBeInTheDocument()
    expect(lastMapMock().easeTo).toHaveBeenCalledWith({
      center: [44.42, 32.542],
      zoom: 9,
    })
  })

  it('returns to the explorer from a selected site', async () => {
    await mountMapTab()
    await userEvent.click(screen.getByRole('button', { name: /Babylon/ }))
    await screen.findByRole('heading', { name: 'Babylon' })

    await userEvent.click(
      screen.getByRole('button', { name: 'Back to explore' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Explore the ancient world' }),
    ).toBeInTheDocument()
  })
})

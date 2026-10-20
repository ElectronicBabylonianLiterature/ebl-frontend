import { act, renderHook } from '@testing-library/react'
import maplibregl from 'maplibre-gl'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { lastMapMock, MapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import useFindspotMap, { FindspotMapOptions } from 'map/useFindspotMap'
import { CATEGORICAL_PAINT } from 'map/mapExcavationPaint'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  SOURCE_ID,
  unclusteredLayer,
  clusterLayer,
} from 'map/mapLayers'
import { EXCAVATION_EXTRUSION_LAYER_ID } from 'map/mapExtrusionLayers'
import {
  pointFeature,
  clusterFeature,
} from 'test-support/map-interaction-fixtures'

function options(): FindspotMapOptions {
  return {
    provenances: [],
    requestedCamera: null,
    isSelectionEnabled: true,
    showBoundaries: true,
    activeHistoricalOverlays: [],
    showExcavationAreas: true,
    polygonVisualizationValues: new Map(),
    excavationPaint: CATEGORICAL_PAINT,
    extrusionScale: null,
    isExtrusionEnabled: false,
    polygonSummaries: new Map(),
    siteSummaries: new Map(),
    siteMarkerStates: new Map(),
    selection: null,
    onSelectFeature: jest.fn(),
    onHoverPreview: jest.fn(),
    onBaseStyleFailure: jest.fn(),
  }
}

function mount(initial = options()) {
  const container = { current: document.createElement('div') }
  return renderHook((value) => useFindspotMap(container, value), {
    initialProps: initial,
  })
}

beforeEach(() => resetMapLibreMock())
afterEach(() => jest.restoreAllMocks())

test('replays initial selection and visualization when the style loads', () => {
  const initial = {
    ...options(),
    selection: { type: 'site', provenanceId: 'babylon' } as const,
    polygonVisualizationValues: new Map([
      [
        'area-a',
        {
          accessibleFragmentCount: 4,
          findspotCount: 1,
          polygonId: 'area-a',
          areaSquareKm: 2,
          mappingEvidence: 'verified-source' as const,
          densityPerSquareKm: 2,
        },
      ],
    ]),
  }
  mount(initial)
  const map = lastMapMock()
  act(() => map.emit('load'))

  expect(map.getFeatureState({ source: SOURCE_ID, id: 'babylon' })).toEqual({
    selected: true,
  })
  expect(
    map.getFeatureState({ source: EXCAVATION_AREAS_SOURCE_ID, id: 'area-a' }),
  ).toEqual(expect.objectContaining({ accessibleFragmentCount: 4 }))
})

test('suppresses normal feature selection while a tool owns map clicks', () => {
  const initial = options()
  const { rerender } = mount(initial)
  const map = lastMapMock()
  act(() => map.emit('load'))
  map.setRenderedFeatures((layers) =>
    layers.includes(unclusteredLayer.id)
      ? [pointFeature('babylon', 'Babylon')]
      : [],
  )
  rerender({ ...initial, isSelectionEnabled: false })
  act(() => map.emit('click', { point: { x: 1, y: 2 } }))
  expect(initial.onSelectFeature).not.toHaveBeenCalled()
  expect(map.easeTo).not.toHaveBeenCalled()
  rerender(initial)
  act(() => map.emit('click', { point: { x: 1, y: 2 } }))
  expect(initial.onSelectFeature).toHaveBeenCalledWith({
    type: 'site',
    provenanceId: 'babylon',
  })
})

test('restores extrusion visibility after areas are re-enabled', () => {
  const initial = { ...options(), isExtrusionEnabled: true }
  const { rerender } = mount(initial)
  const map = lastMapMock()
  act(() => map.emit('load'))
  rerender({ ...initial, showExcavationAreas: false })
  expect(map.getLayer(EXCAVATION_EXTRUSION_LAYER_ID)?.visibility).toBe('none')
  rerender(initial)
  expect(map.getLayer(EXCAVATION_EXTRUSION_LAYER_ID)?.visibility).toBe(
    'visible',
  )
})

test('reports synchronous map construction failures through the existing fallback', () => {
  const initial = options()
  jest.spyOn(maplibregl, 'Map').mockImplementationOnce(() => {
    throw new Error('WebGL unavailable')
  })
  const { result } = mount(initial)
  expect(result.current.current).toBeNull()
  expect(initial.onBaseStyleFailure).toHaveBeenCalledTimes(1)
})

test('rolls back a map when control setup throws', () => {
  const initial = options()
  jest.spyOn(maplibregl, 'NavigationControl').mockImplementationOnce(() => {
    throw new Error('control unavailable')
  })
  const { result, unmount } = mount(initial)
  expect(result.current.current).toBeNull()
  expect(lastMapMock().removed).toBe(true)
  unmount()
  expect(lastMapMock().remove).toHaveBeenCalledTimes(1)
})

test('rejects retained callbacks after cleanup and resets selection bookkeeping', () => {
  const on = jest.spyOn(MapMock.prototype, 'on')
  const initial = options()
  const { result, unmount } = mount(initial)
  const callbacks = on.mock.calls.map(([, listener]) => listener)
  const map = lastMapMock()
  unmount()
  result.current.current = asLibreMap(map)
  callbacks.forEach((listener) =>
    listener({ point: { x: 1, y: 2 }, error: { resourceType: 'Style' } }),
  )
  expect(map.sources.size).toBe(0)
  expect(initial.onSelectFeature).not.toHaveBeenCalled()
  expect(initial.onHoverPreview).not.toHaveBeenCalled()
  expect(initial.onBaseStyleFailure).not.toHaveBeenCalled()
})

test('cleanup leaves a replacement map owned by a newer lifecycle intact', () => {
  const { result, unmount } = mount()
  const original = lastMapMock()
  const replacement = createMapMock()
  result.current.current = asLibreMap(replacement)
  unmount()
  expect(result.current.current).toBe(replacement)
  expect(original.remove).toHaveBeenCalledTimes(1)
  expect(replacement.remove).not.toHaveBeenCalled()
})

test('does not resume an old cluster expansion after a tool opens and closes', async () => {
  const initial = options()
  const { rerender } = mount(initial)
  const map = lastMapMock()
  act(() => map.emit('load'))
  let resolveZoom!: (zoom: number) => void
  map.getSource(SOURCE_ID)?.getClusterExpansionZoom.mockReturnValue(
    new Promise((resolve) => {
      resolveZoom = resolve
    }),
  )
  map.setRenderedFeatures((layers) =>
    layers.includes(clusterLayer.id) ? [clusterFeature(1)] : [],
  )
  act(() => map.emit('click', { point: { x: 1, y: 2 } }))
  rerender({ ...initial, isSelectionEnabled: false })
  rerender(initial)
  resolveZoom(12)
  await Promise.resolve()
  expect(map.easeTo).not.toHaveBeenCalled()
})

test('a newer site click supersedes a pending cluster expansion', async () => {
  mount()
  const map = lastMapMock()
  act(() => map.emit('load'))
  let resolveZoom!: (zoom: number) => void
  map.getSource(SOURCE_ID)?.getClusterExpansionZoom.mockReturnValue(
    new Promise((resolve) => {
      resolveZoom = resolve
    }),
  )
  map.setRenderedFeatures((layers) =>
    layers.includes(clusterLayer.id) ? [clusterFeature(1)] : [],
  )
  act(() => map.emit('click', { point: { x: 1, y: 2 } }))
  map.setRenderedFeatures((layers) =>
    layers.includes(unclusteredLayer.id)
      ? [pointFeature('babylon', 'Babylon')]
      : [],
  )
  act(() => map.emit('click', { point: { x: 1, y: 2 } }))
  resolveZoom(12)
  await Promise.resolve()
  expect(map.easeTo).toHaveBeenCalledTimes(1)
  expect(map.easeTo).toHaveBeenCalledWith({ center: [43.25, 35.45], zoom: 14 })
})

import React from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { excavationPolygon, findspotMapData } from 'test-support/map-fixtures'
import { subscribeToolInput } from 'map/mapToolInput'
import useMapToolInteractions from 'map/useMapToolInteractions'
import useMapExportPolygons from 'map/useMapExportPolygons'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import MapExportPanel from 'map/MapExportPanel'
import { toExportRows } from 'map/mapExportData'
import { assessImageExport } from 'map/mapImageExportRights'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'

jest.mock('maplibre-gl')

it('keeps drawing actions synchronous and cancels pending corners on viewport search', () => {
  const methods = createMapMock()
  methods.bounds = [43, 35, 44, 36]
  methods.jumpTo({ center: [43, 35] })
  const mapRef = { current: asLibreMap(methods) }
  const { result } = renderHook(() =>
    useMapToolInteractions(mapRef, new Map(), new Map(), false, true),
  )
  act(() => result.current.startDrawing())
  act(() => result.current.addPosition([Number.NaN, 35]))
  expect(result.current.cornerCount).toBe(0)
  act(() => result.current.addCornerAtCenter())
  act(() => result.current.addCornerAtCenter())
  expect(result.current.cornerCount).toBe(1)
  expect(result.current.isDrawing).toBe(true)
  act(() => result.current.searchViewport())
  expect(result.current.isDrawing).toBe(false)
  expect(result.current.cornerCount).toBe(0)
  expect(result.current.searchShape?.type).toBe('viewport')
  act(() => result.current.startDrawing())
  expect(result.current.searchShape).toBeNull()
  act(() => {
    result.current.addPosition([43, 35])
    result.current.addPosition([44, 36])
    result.current.addPosition([45, 37])
  })
  expect(result.current.searchShape).toEqual({
    type: 'bounding-box',
    bounds: [43, 35, 44, 36],
  })
  expect(result.current.isDrawing).toBe(false)
})

it('detaches stale tool listeners and ignores their queued callbacks', () => {
  const methods = createMapMock()
  const original = asLibreMap(methods)
  const mapRef = { current: original }
  const addPosition = jest.fn()
  const clear = jest.fn()
  const on = jest.spyOn(methods, 'on')
  const off = jest.spyOn(methods, 'off')
  const dispose = subscribeToolInput(mapRef, addPosition, clear)
  const click = on.mock.calls[0][1]
  mapRef.current = asLibreMap(createMapMock())
  click({ lngLat: { lng: 43, lat: 35 } })
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  expect(addPosition).not.toHaveBeenCalled()
  expect(clear).not.toHaveBeenCalled()
  dispose()
  expect(off).toHaveBeenCalledWith('click', click)
  mapRef.current = original
  click({ lngLat: { lng: 43, lat: 35 } })
  expect(addPosition).not.toHaveBeenCalled()
})

it('exports only visible canonical polygons and ignores replaced-map callbacks', () => {
  const methods = createMapMock()
  methods.setStyleLoaded(true)
  methods.layers.set(EXCAVATION_AREA_FILL_LAYER_ID, {})
  methods.setRenderedFeatures(() => [
    { id: 'visible' },
    { id: 'visible' },
    { id: 'unknown' },
  ])
  const on = jest.spyOn(methods, 'on')
  const off = jest.spyOn(methods, 'off')
  const getLayer = jest.spyOn(methods, 'getLayer')
  const mapRef = { current: asLibreMap(methods) }
  const visible = excavationPolygon({ polygonId: 'visible' })
  const index = new Map([
    ['assur', [visible, excavationPolygon({ polygonId: 'hidden' })]],
  ])
  const { result, unmount } = renderHook(() =>
    useMapExportPolygons(mapRef, index),
  )
  expect(result.current).toEqual([visible])
  const update = on.mock.calls[0][1]
  methods.setRenderedFeatures(() => [])
  act(() => update())
  expect(result.current).toEqual([])
  mapRef.current = asLibreMap(createMapMock())
  getLayer.mockClear()
  act(() => update())
  expect(getLayer).not.toHaveBeenCalled()
  unmount()
  expect(off).toHaveBeenCalledTimes(3)
})

it('subscribes when the owner creates its map after the panel first renders', () => {
  const methods = createMapMock()
  methods.setStyleLoaded(true)
  methods.layers.set(EXCAVATION_AREA_FILL_LAYER_ID, {})
  methods.setRenderedFeatures(() => [{ id: 'visible' }])
  const mapRef: { current: MapLibreMap | null } = { current: null }
  const visible = excavationPolygon({ polygonId: 'visible' })
  const index = new Map([['assur', [visible]]])
  const { result, rerender } = renderHook(() =>
    useMapExportPolygons(mapRef, index),
  )
  expect(result.current).toEqual([])
  mapRef.current = asLibreMap(methods)
  rerender()
  expect(result.current).toEqual([visible])
})

it('labels spatial links with complete locations and retains canonical navigation', () => {
  const addCenter = jest.fn()
  render(
    <MemoryRouter>
      <MapSpatialSearchPanel
        shape={{ type: 'viewport', bounds: [43, 35, 44, 36] }}
        result={{
          polygonIds: ['p'],
          findspotIds: [7],
          mappedPolygonCount: 1,
          accessibleFragmentCount: 3,
        }}
        findspots={[
          findspotMapData({
            findspotId: 7,
            sector: 'Sector',
            area: 'Area',
            building: 'Temple',
            room: 'Room',
          }),
        ]}
        dataStatus="loaded"
        isDrawing={false}
        cornerCount={0}
        onAddCornerAtCenter={addCenter}
        onClear={jest.fn()}
        onStartDrawing={jest.fn()}
        onSearchViewport={jest.fn()}
      />
    </MemoryRouter>,
  )
  expect(
    screen.getByRole('link', {
      name: 'Tablets from Sector · Area · Temple · Room',
    }),
  ).toHaveAttribute('href', '/library/search?findspotId=7')
  expect(screen.getByRole('status')).toHaveTextContent('3 accessible tablets')
  expect(
    screen.getByRole('button', { name: 'Add corner at map center' }),
  ).toBeDisabled()
})

it('offers keyboard drawing corners and a usable cancel action before a shape exists', async () => {
  const addCenter = jest.fn()
  const clear = jest.fn()
  render(
    <MemoryRouter>
      <MapSpatialSearchPanel
        shape={null}
        result={{
          polygonIds: [],
          findspotIds: [],
          mappedPolygonCount: 0,
          accessibleFragmentCount: 0,
        }}
        findspots={[]}
        dataStatus="loaded"
        isDrawing
        cornerCount={1}
        onAddCornerAtCenter={addCenter}
        onClear={clear}
        onStartDrawing={jest.fn()}
        onSearchViewport={jest.fn()}
      />
    </MemoryRouter>,
  )
  expect(screen.getByRole('status')).toHaveTextContent('Add corner 2 of 2')
  await userEvent.click(
    screen.getByRole('button', { name: 'Add corner at map center' }),
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Cancel rectangle' }),
  )
  expect(addCenter).toHaveBeenCalledTimes(1)
  expect(clear).toHaveBeenCalledTimes(1)
})

it.each(['loading', 'error'] as const)(
  'blocks misleading exports while data is %s',
  (dataStatus) => {
    render(
      <MemoryRouter>
        <MapExportPanel
          rows={toExportRows([excavationPolygon()], new Map())}
          dataStatus={dataStatus}
          imageExport={assessImageExport({
            activeOverlays: [],
            preservesDrawingBuffer: false,
          })}
          buildContext={() => ({
            visualization: 'mapped',
            siteFilter: '',
            shareUrl: '',
            exportedAt: '',
          })}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Download GeoJSON' }),
    ).toBeDisabled()
    expect(
      screen.getByText(/Tablet data is unavailable or still loading/),
    ).toBeVisible()
  },
)

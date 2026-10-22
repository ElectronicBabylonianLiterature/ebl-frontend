import React from 'react'
import { act, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { renderMapTab } from 'test-support/map-render'
import {
  findspotMapData,
  polygonFeature,
  provenanceRecord,
} from 'test-support/map-fixtures'
import useMapToolInteractions from 'map/useMapToolInteractions'
import MapMeasurePanel from 'map/MapMeasurePanel'
import { render } from '@testing-library/react'

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

it('adds measurement points through the connected keyboard control and clears them', async () => {
  renderMapTab({
    provenances: [provenanceRecord({ id: 'assur', longName: 'Aššur' })],
    mapData: [findspotMapData()],
  })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  const map = lastMapMock()
  act(() => map.emit('load'))
  await userEvent.click(screen.getByRole('button', { name: 'Measure' }))
  const panel = screen.getByRole('region', { name: 'Measure' })
  const addPoint = within(panel).getByRole('button', {
    name: 'Add point at map center',
  })
  const status = within(panel).getByText(
    'Select points on the map to measure a distance.',
  )
  act(() => map.jumpTo({ center: [43.25, 35.45] }))
  addPoint.focus()
  await userEvent.keyboard('{Enter}')
  expect(status).toHaveTextContent('Add 1 more point.')
  act(() => map.jumpTo({ center: [43.26, 35.45] }))
  await userEvent.keyboard(' ')
  expect(status).toHaveTextContent(/ m$/)
  expect(addPoint).toHaveFocus()
  expect(within(panel).getByText(/use arrow keys/)).toHaveTextContent(
    'Escape clears the measurement.',
  )

  await userEvent.click(
    within(panel).getByRole('button', { name: 'Clear measurement' }),
  )
  expect(status).toHaveTextContent(
    'Select points on the map to measure a distance.',
  )
})

it('guards inactive, missing-map and nonfinite centers using the click append path', () => {
  const methods = createMapMock()
  const mapRef: { current: MapLibreMap | null } = { current: null }
  const { result, rerender } = renderHook(
    ({ isMeasuring }) =>
      useMapToolInteractions(mapRef, new Map(), new Map(), isMeasuring, true),
    { initialProps: { isMeasuring: true } },
  )
  act(() => result.current.addMeasurementAtCenter())
  expect(result.current.measurementPositions).toEqual([])
  mapRef.current = asLibreMap(methods)
  methods.jumpTo({ center: [Number.NaN, 35] })
  act(() => result.current.addMeasurementAtCenter())
  expect(result.current.measurementPositions).toEqual([])
  methods.jumpTo({ center: [43, 35] })
  act(() => result.current.setMeasurementMode('area'))
  act(() => result.current.addMeasurementAtCenter())
  expect(result.current.measurementPositions).toEqual([[43, 35]])
  expect(result.current.measurementMode).toBe('area')
  rerender({ isMeasuring: false })
  act(() => result.current.startDrawing())
  act(() => result.current.addMeasurementAtCenter())
  expect(result.current.measurementPositions).toEqual([])
  expect(result.current.cornerCount).toBe(0)
})

it('keeps mode, units and the elevation display connected to the measurement panel', async () => {
  const onModeChange = jest.fn()
  const onUnitsChange = jest.fn()
  const { rerender } = render(
    <MapMeasurePanel
      mode="distance"
      units="metric"
      positions={[]}
      onModeChange={onModeChange}
      onUnitsChange={onUnitsChange}
      onAddPointAtCenter={jest.fn()}
      onClear={jest.fn()}
      elevation={{ status: 'empty', profile: null, sampleCount: 0 }}
    />,
  )
  await userEvent.selectOptions(screen.getByLabelText('Measure'), 'area')
  await userEvent.selectOptions(screen.getByLabelText('Units'), 'imperial')
  expect(onModeChange).toHaveBeenCalledWith('area')
  expect(onUnitsChange).toHaveBeenCalledWith('imperial')
  rerender(
    <MapMeasurePanel
      mode="area"
      units="imperial"
      positions={[[43, 35]]}
      onModeChange={onModeChange}
      onUnitsChange={onUnitsChange}
      onAddPointAtCenter={jest.fn()}
      onClear={jest.fn()}
      elevation={{ status: 'empty', profile: null, sampleCount: 0 }}
    />,
  )
  expect(
    screen.getByRole('button', { name: 'Clear measurement' }),
  ).toBeEnabled()
  expect(screen.getByRole('status')).toHaveTextContent('Add 2 more points.')
})

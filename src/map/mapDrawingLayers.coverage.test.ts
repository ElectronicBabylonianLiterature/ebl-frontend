import {
  addMeasurementLayers,
  removeMeasurementLayers,
  MEASUREMENT_POINT_LAYER_ID,
} from 'map/mapMeasurementLayers'
import {
  createSpatialSearchLayerLifecycle,
  removeSpatialSearchLayers,
} from 'map/mapSpatialSearchLayers'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import {
  mockMapInstance,
  mockAddSource,
  mockAddLayer,
  mockRemoveLayer,
  mockRemoveSource,
  mockOn,
  mockGetStyle,
  mockGetSource,
  markLayersAdded,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('keeps an existing measurement point layer while repairing a missing line', () => {
  markLayersAdded(MEASUREMENT_POINT_LAYER_ID)
  addMeasurementLayers(asLibreMap(mockMapInstance))
  expect(mockAddLayer).toHaveBeenCalledTimes(1)
  expect(mockAddLayer).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'ebl-measurement-line' }),
  )
})

it('safely removes measurement and search resources from an empty style', () => {
  removeMeasurementLayers(asLibreMap(mockMapInstance))
  removeSpatialSearchLayers(asLibreMap(mockMapInstance))
  expect(mockRemoveLayer).not.toHaveBeenCalled()
  expect(mockRemoveSource).not.toHaveBeenCalled()
})

it('removes installed measurement layers before their data source', () => {
  addMeasurementLayers(asLibreMap(mockMapInstance))
  mockGetSource.mockReturnValue({ setData: jest.fn() })
  addMeasurementLayers(asLibreMap(mockMapInstance))
  expect(mockAddSource).toHaveBeenCalledTimes(1)
  expect(mockAddLayer).toHaveBeenCalledTimes(2)
  removeMeasurementLayers(asLibreMap(mockMapInstance))
  expect(mockRemoveLayer.mock.calls).toEqual([
    ['ebl-measurement-point'],
    ['ebl-measurement-line'],
  ])
  expect(mockRemoveSource).toHaveBeenCalledWith('ebl-measurement')
  expect(mockRemoveLayer.mock.invocationCallOrder[1]).toBeLessThan(
    mockRemoveSource.mock.invocationCallOrder[0],
  )
})

it('does not install spatial resources until an initially absent style loads', () => {
  mockGetStyle.mockReturnValue(undefined)
  const lifecycle = createSpatialSearchLayerLifecycle(
    asLibreMap(mockMapInstance),
  )
  expect(mockAddSource).not.toHaveBeenCalled()
  triggerMapEvent(MAP_STYLE_LOAD_EVENT)
  expect(mockAddSource).toHaveBeenCalledTimes(1)
  lifecycle.dispose()
})

it('ignores a queued style callback after disposal', () => {
  const lifecycle = createSpatialSearchLayerLifecycle(
    asLibreMap(mockMapInstance),
  )
  const callback = mockOn.mock.calls.find(
    ([event]) => event === MAP_STYLE_LOAD_EVENT,
  )?.[1]
  expect(callback).toBeDefined()
  lifecycle.dispose()
  mockAddSource.mockClear()
  callback()
  expect(mockAddSource).not.toHaveBeenCalled()
})

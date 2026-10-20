import { subscribeMeasurement } from 'map/mapMeasurementLifecycle'
import {
  mockAddSource,
  mockMapInstance,
  mockOff,
  mockOn,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import { asLibreMap } from 'test-support/maplibre-map-helpers'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('ignores stale and malformed clicks and handles only its drawing shortcuts', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const actions = {
    addPoint: jest.fn(),
    clear: jest.fn(),
    removeLastPoint: jest.fn(),
  }
  let isActive = true
  const dispose = subscribeMeasurement(
    mapRef,
    () => ({ isActive, mode: 'distance', positions: [[0, 0]] }),
    actions,
  )

  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: Number.NaN, lat: 0 },
  })
  isActive = false
  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: 0, lat: 0 },
  })
  expect(actions.addPoint).not.toHaveBeenCalled()

  isActive = true
  const unrelated = new KeyboardEvent('keydown', {
    key: 'Enter',
    cancelable: true,
  })
  window.dispatchEvent(unrelated)
  expect(unrelated.defaultPrevented).toBe(false)
  expect(actions.clear).not.toHaveBeenCalled()
  expect(actions.removeLastPoint).not.toHaveBeenCalled()

  const escape = new KeyboardEvent('keydown', {
    key: 'Escape',
    cancelable: true,
  })
  window.dispatchEvent(escape)
  expect(escape.defaultPrevented).toBe(true)
  expect(actions.clear).toHaveBeenCalledTimes(1)
  dispose?.()
})

it('ignores old map events and shortcuts after the map is replaced', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const actions = {
    addPoint: jest.fn(),
    clear: jest.fn(),
    removeLastPoint: jest.fn(),
  }
  const dispose = subscribeMeasurement(
    mapRef,
    () => ({ isActive: true, mode: 'distance', positions: [[0, 0]] }),
    actions,
  )
  mockAddSource.mockClear()
  mapRef.current = asLibreMap({ ...mockMapInstance })

  triggerMapEvent(MAP_STYLE_LOAD_EVENT)
  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: 43, lat: 35 },
  })
  const escape = new KeyboardEvent('keydown', {
    key: 'Escape',
    cancelable: true,
  })
  window.dispatchEvent(escape)

  expect(mockAddSource).not.toHaveBeenCalled()
  Object.values(actions).forEach((action) =>
    expect(action).not.toHaveBeenCalled(),
  )
  expect(escape.defaultPrevented).toBe(false)
  dispose?.()
})

it('keeps disposed callbacks inactive when the original map is reused', () => {
  const map = asLibreMap(mockMapInstance)
  const mapRef = { current: map }
  const actions = {
    addPoint: jest.fn(),
    clear: jest.fn(),
    removeLastPoint: jest.fn(),
  }
  const dispose = subscribeMeasurement(
    mapRef,
    () => ({ isActive: true, mode: 'distance', positions: [[0, 0]] }),
    actions,
  )
  const callbacks = mockOn.mock.calls.map(([, callback]) => callback)
  mapRef.current = asLibreMap({ ...mockMapInstance })
  dispose?.()
  mapRef.current = map
  mockAddSource.mockClear()

  callbacks.forEach((callback) =>
    callback({
      point: { x: 0, y: 0 },
      lngLat: { lng: 43, lat: 35 },
    }),
  )

  expect(mockOff).toHaveBeenCalledWith(
    MAP_STYLE_LOAD_EVENT,
    expect.any(Function),
  )
  expect(mockOff).toHaveBeenCalledWith('click', expect.any(Function))
  expect(mockAddSource).not.toHaveBeenCalled()
  expect(actions.addPoint).not.toHaveBeenCalled()
})

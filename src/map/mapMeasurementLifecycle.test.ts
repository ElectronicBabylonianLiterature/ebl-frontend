import { subscribeMeasurement } from 'map/mapMeasurementLifecycle'
import {
  mockMapInstance,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

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

import { subscribeSpatialSearch } from 'map/mapSpatialSearchLifecycle'
import { addSpatialSearchCorner } from 'map/mapSpatialSearchDrawing'
import {
  mockMapInstance,
  mockOn,
  mockOff,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('ignores stale and malformed clicks and leaves unrelated keys alone', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const addCorner = jest.fn()
  const clear = jest.fn()
  let isActive = true
  let isDrawing = true
  const lifecycle = subscribeSpatialSearch(
    mapRef,
    () => ({ isActive, isDrawing }),
    addCorner,
    clear,
  )

  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: Number.NaN, lat: 0 },
  })
  const unrelated = new KeyboardEvent('keydown', {
    key: 'Enter',
    cancelable: true,
  })
  window.dispatchEvent(unrelated)
  expect(unrelated.defaultPrevented).toBe(false)

  isDrawing = false
  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: 0, lat: 0 },
  })
  isActive = false
  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: 0, lat: 0 },
  })
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  expect(addCorner).not.toHaveBeenCalled()
  expect(clear).not.toHaveBeenCalled()
  lifecycle?.dispose()
})

it.each([
  { isActive: false, isDrawing: true },
  { isActive: true, isDrawing: false },
])('does not alter a drawing when its tool is inactive: %p', (state) => {
  const actions = {
    setValidationMessage: jest.fn(),
    replaceDrawStart: jest.fn(),
    replaceShape: jest.fn(),
    replaceDrawing: jest.fn(),
  }
  addSpatialSearchCorner([43, 35], { ...state, firstCorner: null }, actions)
  Object.values(actions).forEach((action) =>
    expect(action).not.toHaveBeenCalled(),
  )
})

it('ignores old map clicks and keyboard events after the map is replaced', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const addCorner = jest.fn()
  const clear = jest.fn()
  const lifecycle = subscribeSpatialSearch(
    mapRef,
    () => ({ isActive: true, isDrawing: true }),
    addCorner,
    clear,
  )
  mapRef.current = asLibreMap({ ...mockMapInstance })

  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: 43, lat: 35 },
  })
  const escape = new KeyboardEvent('keydown', {
    key: 'Escape',
    cancelable: true,
  })
  window.dispatchEvent(escape)

  expect(addCorner).not.toHaveBeenCalled()
  expect(clear).not.toHaveBeenCalled()
  expect(escape.defaultPrevented).toBe(false)
  lifecycle?.dispose()
})

it('keeps disposed map callbacks inactive if the map reference is reused', () => {
  const map = asLibreMap(mockMapInstance)
  const mapRef = { current: map }
  const addCorner = jest.fn()
  const lifecycle = subscribeSpatialSearch(
    mapRef,
    () => ({ isActive: true, isDrawing: true }),
    addCorner,
    jest.fn(),
  )
  const handleClick = mockOn.mock.calls.find(
    ([event]) => event === 'click',
  )?.[1]
  mapRef.current = asLibreMap({ ...mockMapInstance })
  lifecycle?.dispose()
  mapRef.current = map

  expect(mockOff).toHaveBeenCalledWith('click', handleClick)
  handleClick({
    point: { x: 0, y: 0 },
    lngLat: { lng: 43, lat: 35 },
  })

  expect(addCorner).not.toHaveBeenCalled()
})

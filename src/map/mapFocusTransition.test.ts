import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import { captureMapFocus, runMapFocus } from 'map/mapFocusTransition'

beforeEach(() => resetMapLibreMock())

it('does not retain a focus that completes synchronously', () => {
  const map = asLibreMap(createMapMock())
  const focus = jest.fn()

  runMapFocus(map, focus)

  expect(focus).toHaveBeenCalledTimes(1)
  expect(captureMapFocus(map)).toBeUndefined()
})

it('captures a moving target before padding completes its previous flight', () => {
  const mapMock = createMapMock()
  const map = asLibreMap(mapMock)
  mapMock.isMoving.mockReturnValue(true)
  const focus = jest.fn()
  runMapFocus(map, focus)

  const resume = captureMapFocus(map)
  mapMock.emit('moveend')
  expect(captureMapFocus(map)).toBeUndefined()
  resume?.()

  expect(focus).toHaveBeenCalledTimes(2)
  expect(mapMock.listenerCount('moveend')).toBe(1)
})

it('preserves the new focus if a captured old completion runs late', () => {
  const mapMock = createMapMock()
  const map = asLibreMap(mapMock)
  mapMock.isMoving.mockReturnValue(true)
  const subscribe = jest.spyOn(mapMock, 'on')
  runMapFocus(map, jest.fn())
  const oldCompletion = subscribe.mock.calls.find(
    ([event]) => event === 'moveend',
  )?.[1]
  const nextFocus = jest.fn()
  runMapFocus(map, nextFocus)

  oldCompletion?.({})
  captureMapFocus(map)?.()

  expect(nextFocus).toHaveBeenCalledTimes(2)
  expect(mapMock.listenerCount('moveend')).toBe(1)
})

it.each(['moveend', 'remove'])(
  'releases the target and both listeners on %s',
  (event) => {
    const mapMock = createMapMock()
    const map = asLibreMap(mapMock)
    mapMock.isMoving.mockReturnValue(true)
    runMapFocus(map, jest.fn())

    mapMock.emit(event)

    expect(captureMapFocus(map)).toBeUndefined()
    expect(mapMock.listenerCount('moveend')).toBe(0)
    expect(mapMock.listenerCount('remove')).toBe(0)
  },
)

it('retains a reduced-motion selection only until its pending panel is measured', () => {
  const mapMock = createMapMock()
  const map = asLibreMap(mapMock)
  const focus = jest.fn()
  runMapFocus(map, focus, true)

  const resume = captureMapFocus(map)
  mapMock.emit('movestart')
  mapMock.setPadding({ top: 0, right: 0, bottom: 382, left: 0 })
  mapMock.emit('moveend')
  resume?.()

  expect(focus).toHaveBeenCalledTimes(2)
  expect(captureMapFocus(map)).toBeUndefined()
  expect(mapMock.listenerCount('movestart')).toBe(0)
  expect(mapMock.listenerCount('remove')).toBe(0)
})

it.each(['movestart', 'remove'])(
  'cancels a completed selection waiting for its panel on %s',
  (event) => {
    const mapMock = createMapMock()
    const map = asLibreMap(mapMock)
    runMapFocus(map, jest.fn(), true)

    mapMock.emit(event)

    expect(captureMapFocus(map)).toBeUndefined()
    expect(mapMock.listenerCount('movestart')).toBe(0)
    expect(mapMock.listenerCount('remove')).toBe(0)
  },
)

import type { Map as MapLibreMap } from 'maplibre-gl'
import { observeExcavationAvailability } from 'map/mapExcavationAvailability'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapExcavationLayers'

function sourceEvents() {
  const handlers = new Map<string, (event: object) => void>()
  const methods = {
    on: jest.fn((event: string, handler: (event: object) => void) => {
      handlers.set(event, handler)
    }),
    off: jest.fn((event: string) => handlers.delete(event)),
    getSource: jest.fn<object | undefined, []>(() => ({})),
  }
  return { map: methods as unknown as MapLibreMap, methods, handlers }
}

it('recovers a failed source only after matching content has loaded', () => {
  const { map, handlers } = sourceEvents()
  const onChange = jest.fn()
  observeExcavationAvailability(map, ['area-fill'], onChange)
  handlers.get('error')?.({ sourceId: EXCAVATION_AREAS_SOURCE_ID })
  expect(onChange).toHaveBeenLastCalledWith(true)

  const loaded = {
    sourceId: EXCAVATION_AREAS_SOURCE_ID,
    sourceDataType: 'content',
    isSourceLoaded: true,
  }
  onChange.mockClear()
  handlers.get('sourcedata')?.({ ...loaded, sourceId: 'other' })
  handlers.get('sourcedata')?.({ ...loaded, isSourceLoaded: false })
  handlers.get('sourcedata')?.({ ...loaded, sourceDataType: 'metadata' })
  expect(onChange).not.toHaveBeenCalled()
  handlers.get('sourcedata')?.(loaded)
  expect(onChange).toHaveBeenCalledWith(false)
})

it('ignores removed sources and detaches both listeners on disposal', () => {
  const { map, methods, handlers } = sourceEvents()
  const onChange = jest.fn()
  const dispose = observeExcavationAvailability(map, ['area-fill'], onChange)
  handlers.get('error')?.({ layer: { id: 'other' } })
  expect(onChange).not.toHaveBeenCalled()
  handlers.get('error')?.({ layer: { id: 'area-fill' } })
  expect(onChange).toHaveBeenCalledWith(true)
  onChange.mockClear()
  methods.getSource.mockReturnValue(undefined)
  handlers.get('sourcedata')?.({
    sourceId: EXCAVATION_AREAS_SOURCE_ID,
    sourceDataType: 'content',
    isSourceLoaded: true,
  })
  expect(onChange).not.toHaveBeenCalled()
  dispose()
  expect(methods.off).toHaveBeenCalledWith('error', expect.any(Function))
  expect(methods.off).toHaveBeenCalledWith('sourcedata', expect.any(Function))
  expect(handlers.size).toBe(0)
})

it('does not require an availability callback', () => {
  const { map, handlers } = sourceEvents()
  observeExcavationAvailability(map, [])
  expect(() => {
    handlers.get('error')?.({ sourceId: EXCAVATION_AREAS_SOURCE_ID })
    handlers.get('sourcedata')?.({
      sourceId: EXCAVATION_AREAS_SOURCE_ID,
      sourceDataType: 'content',
      isSourceLoaded: true,
    })
  }).not.toThrow()
})

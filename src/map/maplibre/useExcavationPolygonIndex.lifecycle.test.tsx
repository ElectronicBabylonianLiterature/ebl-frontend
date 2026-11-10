import { act, renderHook, waitFor } from '@testing-library/react'
import {
  fetchExcavationPolygonIndex,
  type ExcavationPolygonIndex,
} from 'map/domain/excavationPolygonIndex'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'

jest.mock('map/domain/excavationPolygonIndex')
const fetchIndex = fetchExcavationPolygonIndex as jest.MockedFunction<
  typeof fetchExcavationPolygonIndex
>

beforeEach((): void => {
  fetchIndex.mockReset()
})

it('exposes a successfully validated index', async (): Promise<void> => {
  const index: ExcavationPolygonIndex = new Map()
  fetchIndex.mockResolvedValue(index)
  const { result } = renderHook(useExcavationPolygonIndex)
  await waitFor((): void => expect(result.current.isLoaded).toBe(true))
  expect(result.current.index).toBe(index)
  expect(result.current.error).toBeNull()
})

it.each([new Error('Invalid geometry'), 'Invalid geometry'])(
  'normalizes a rejected index into the visible error state: %s',
  async (reason: Error | string): Promise<void> => {
    fetchIndex.mockRejectedValue(reason)
    const { result } = renderHook(useExcavationPolygonIndex)
    await waitFor((): void => expect(result.current.isLoaded).toBe(true))
    expect(result.current.error).toEqual(new Error('Invalid geometry'))
    expect(result.current.index.size).toBe(0)
  },
)

it.each(['resolve', 'reject'] as const)(
  'ignores a late %s after the map unmounts',
  async (outcome: 'resolve' | 'reject'): Promise<void> => {
    let resolveIndex: (index: ExcavationPolygonIndex) => void = (): void => {}
    let rejectIndex: (reason: Error) => void = (): void => {}
    fetchIndex.mockReturnValue(
      new Promise((resolve, reject): void => {
        resolveIndex = resolve
        rejectIndex = reject
      }),
    )
    const { result, unmount } = renderHook(useExcavationPolygonIndex)
    unmount()
    await act(async (): Promise<void> => {
      if (outcome === 'resolve') resolveIndex(new Map())
      else rejectIndex(new Error('Late source failure'))
      await Promise.resolve()
    })
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.error).toBeNull()
  },
)

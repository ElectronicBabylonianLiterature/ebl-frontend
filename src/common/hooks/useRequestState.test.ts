import { renderHook, waitFor } from '@testing-library/react'
import useRequestState, {
  isPendingOrNonEmpty,
} from 'common/hooks/useRequestState'

test('is unavailable without a key and does not request', () => {
  const request = jest.fn()
  const { result } = renderHook(() => useRequestState(null, request))
  expect(result.current).toEqual({ status: 'unavailable' })
  expect(request).not.toHaveBeenCalled()
})

test('loads the data', async () => {
  const { result } = renderHook(() =>
    useRequestState('key', () => Promise.resolve(['data'])),
  )
  expect(result.current).toEqual({ status: 'loading' })
  await waitFor(() =>
    expect(result.current).toEqual({ status: 'loaded', data: ['data'] }),
  )
})

test('reports an error', async () => {
  const { result } = renderHook(() =>
    useRequestState('key', () => Promise.reject(new Error('failed'))),
  )
  await waitFor(() => expect(result.current).toEqual({ status: 'error' }))
})

test('aborts the request when the key changes', async () => {
  const signals: AbortSignal[] = []
  const { rerender, result } = renderHook(
    ({ key }) =>
      useRequestState(key, (signal) => {
        signals.push(signal)
        return Promise.resolve(key)
      }),
    { initialProps: { key: 'first' } },
  )
  rerender({ key: 'second' })
  expect(signals[0].aborted).toBe(true)
  await waitFor(() =>
    expect(result.current).toEqual({ status: 'loaded', data: 'second' }),
  )
})

test.each([
  [{ status: 'unavailable' } as const, false],
  [{ status: 'loading' } as const, true],
  [{ status: 'error' } as const, true],
  [{ status: 'loaded', data: [] } as const, false],
  [{ status: 'loaded', data: [1] } as const, true],
])('tells whether %p may have content', (state, expected) => {
  expect(isPendingOrNonEmpty(state)).toBe(expected)
})

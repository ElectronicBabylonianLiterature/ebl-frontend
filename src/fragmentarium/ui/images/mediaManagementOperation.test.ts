import { act, renderHook } from '@testing-library/react'
import {
  useMediaOperation,
  STALE_MEDIA_MESSAGE,
} from 'fragmentarium/ui/images/mediaManagementOperation'
import { ApiError } from 'http/ApiError'

test('runs success once, rejects duplicate attempts while saving and clears a previous error', async () => {
  const success = jest.fn()
  const { result } = renderHook(() => useMediaOperation(success))
  await act(async () =>
    result.current.run(() => Promise.reject(new Error('Offline'))),
  )
  expect(result.current.error?.message).toBe('Offline')
  act(() => result.current.clearError())
  expect(result.current.error).toBeNull()
  let resolve = (): void => undefined
  const operation = jest.fn(
    () =>
      new Promise<void>((complete) => {
        resolve = complete
      }),
  )
  let pending: Promise<void>
  act(() => {
    pending = result.current.run(operation)
  })
  expect(result.current.saving).toBe(true)
  await act(async () => result.current.run(operation))
  expect(operation).toHaveBeenCalledTimes(1)
  await act(async () => {
    resolve()
    await pending!
  })
  expect(success).toHaveBeenCalledTimes(1)
  expect(result.current.saving).toBe(false)
})

test.each([412, 428])(
  'defaults stale HTTP %p to the uncertainty refresh while showing a conflict',
  async (status) => {
    const refresh = jest.fn()
    const { result } = renderHook(() => useMediaOperation(jest.fn(), refresh))
    await act(async () =>
      result.current.run(() =>
        Promise.reject(new ApiError('Conflict', {}, status)),
      ),
    )
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(result.current.error?.message).toBe(STALE_MEDIA_MESSAGE)
    expect(result.current.saving).toBe(false)
  },
)

test.each(['resolve', 'reject'] as const)(
  'unmount aborts a pending request and fences its late %s',
  async (outcome) => {
    const success = jest.fn(),
      uncertain = jest.fn(),
      stale = jest.fn()
    const { result, unmount } = renderHook(() =>
      useMediaOperation(success, uncertain, stale),
    )
    let settle = (): void => undefined
    let signal: AbortSignal | undefined
    let pending: Promise<void>
    act(() => {
      pending = result.current.run((requestSignal) => {
        signal = requestSignal
        return new Promise<void>((resolve, reject) => {
          settle = () =>
            outcome === 'resolve'
              ? resolve()
              : reject(new Error('Late failure'))
        })
      })
    })
    unmount()
    expect(signal?.aborted).toBe(true)
    await act(async () => {
      settle()
      await pending!
    })
    expect(success).not.toHaveBeenCalled()
    expect(uncertain).not.toHaveBeenCalled()
    expect(stale).not.toHaveBeenCalled()
  },
)

import {
  createAbortError,
  isAbortError,
  isCancellation,
  rejectOnAbort,
} from 'common/utils/abortError'
import { abortedSignalWithReason } from 'test-support/abortedSignal'

describe('isAbortError', () => {
  it.each([
    [new DOMException('aborted', 'AbortError'), true],
    [Object.assign(new Error('aborted'), { name: 'AbortError' }), true],
    [new Error('network failure'), false],
    [undefined, false],
    [null, false],
    ['AbortError', false],
  ])('%s is an abort error: %s', (error, expected) => {
    expect(isAbortError(error)).toBe(expected)
  })
})

describe('isCancellation', () => {
  it('is true for an abort error without a signal', () => {
    expect(isCancellation(new DOMException('aborted', 'AbortError'))).toBe(true)
  })

  it('is true for any error when the signal is aborted', () => {
    const controller = new AbortController()
    controller.abort()
    expect(isCancellation(new Error('boom'), controller.signal)).toBe(true)
  })

  it('is false for an unrelated error and a live signal', () => {
    const controller = new AbortController()
    expect(isCancellation(new Error('boom'), controller.signal)).toBe(false)
  })

  it('is false for an unrelated error without a signal', () => {
    expect(isCancellation(new Error('boom'))).toBe(false)
  })
})

describe('rejectOnAbort', () => {
  const pending = new Promise<string>(() => undefined)

  it('returns the promise unchanged without a signal', () => {
    expect(rejectOnAbort(pending)).toBe(pending)
  })

  it('rejects when the signal aborts before the promise settles', async () => {
    const controller = new AbortController()
    const result = rejectOnAbort(pending, controller.signal)
    controller.abort()
    await expect(result).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('rejects when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      rejectOnAbort(Promise.resolve('value'), controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('settles with the promise when the signal stays live', async () => {
    const { signal } = new AbortController()
    await expect(rejectOnAbort(Promise.resolve('value'), signal)).resolves.toBe(
      'value',
    )
    await expect(
      rejectOnAbort(Promise.reject(new Error('boom')), signal),
    ).rejects.toThrow('boom')
  })
})

describe('createAbortError', () => {
  it('uses the abort reason when the signal provides one', () => {
    const reason = new Error('caller gave up')
    const signal = abortedSignalWithReason(reason)
    expect(createAbortError(signal)).toBe(reason)
  })

  it('falls back to an AbortError when the signal has no reason', () => {
    const controller = new AbortController()
    controller.abort()
    expect(createAbortError(controller.signal)).toMatchObject({
      name: 'AbortError',
    })
  })
})

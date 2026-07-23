import { createAbortError, isAbortError, isCancellation } from './abortError'

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

describe('createAbortError', () => {
  it('uses the abort reason when the signal provides one', () => {
    const reason = new Error('caller gave up')
    const signal = { aborted: true, reason } as unknown as AbortSignal
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

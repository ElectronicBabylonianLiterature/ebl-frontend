import { ApiError } from 'http/ApiClient'
import { isDefinitiveRejection, isStaleRevision } from 'http/ApiError'
import {
  CaptureStackTraceOverride,
  overrideCaptureStackTrace,
} from 'test-support/captureStackTraceOverride'

test.each([
  ['Description', { title: 'hide', description: 'Description' }],
  ['Title: {"key":"value"}', { title: 'Title', description: { key: 'value' } }],
  ['status: {"key":"value"}', { description: { key: 'value' } }],
  ['{"key":"value"}', { key: 'value' }],
])('bodyToMessage %s', (message, body) => {
  expect(ApiError.bodyToMessage(body, 'status')).toEqual(message)
})

describe('ApiError Construction', () => {
  test('ApiError name is set correctly', () => {
    const error = new ApiError('Test error', { status: 400 })
    expect(error.name).toBe('ApiError')
  })

  test('ApiError preserves stack trace', () => {
    const error = new ApiError('Test error', {})
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('ApiError')
  })

  test('ApiError.fromResponse handles malformed JSON', async () => {
    const response = new Response('not json', {
      status: 400,
      statusText: 'Bad Request',
    })
    const error = await ApiError.fromResponse(response)

    expect(error.message).toBe('Bad Request')
    expect(error.data).toEqual({})
  })

  test('ApiError.bodyToMessage handles string description', () => {
    const message = ApiError.bodyToMessage(
      { description: 'Simple error' },
      'Bad Request',
    )
    expect(message).toBe('Simple error')
  })

  test('ApiError.bodyToMessage handles object description', () => {
    const message = ApiError.bodyToMessage(
      { title: 'Error', description: { code: 'ERR_001' } },
      'Bad Request',
    )
    expect(message).toContain('Error')
    expect(message).toContain('ERR_001')
  })

  test('ApiError.bodyToMessage falls back to JSON stringify', () => {
    const message = ApiError.bodyToMessage({ custom: 'field' }, 'Bad Request')
    expect(message).toBe('{"custom":"field"}')
  })

  test('ApiError.bodyToMessage omits an absent description', () => {
    const message = ApiError.bodyToMessage({ title: 'Error' }, 'Bad Request')
    expect(message).toBe('Error')
  })
})

describe('On an engine without Error.captureStackTrace', () => {
  let captureStackTraceOverride: CaptureStackTraceOverride

  beforeEach(() => {
    captureStackTraceOverride = overrideCaptureStackTrace()
    captureStackTraceOverride.remove()
  })

  afterEach(() => {
    captureStackTraceOverride.restore()
  })

  test('Constructing an ApiError does not throw', () => {
    const error = new ApiError('Test error', { status: 400 }, 400)

    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Test error')
    expect(error.status).toBe(400)
    expect(error.stack).toContain('Test error')
  })

  test('fromResponse preserves the server error instead of a TypeError', async () => {
    const response = new Response(
      JSON.stringify({ description: 'Fragment not found' }),
      { status: 404, statusText: 'Not Found' },
    )

    const error = await ApiError.fromResponse(response)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Fragment not found')
    expect(error.status).toBe(404)
  })

  test('fromResponse still falls back to the status text on malformed JSON', async () => {
    const response = new Response('not json', {
      status: 400,
      statusText: 'Bad Request',
    })

    const error = await ApiError.fromResponse(response)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Bad Request')
  })
})

test('fromResponse falls back to the HTTP status when a non-JSON error has no status text', async () => {
  const response = {
    status: 502,
    statusText: '',
    json: () => Promise.reject(new SyntaxError('Unexpected token <')),
  } as unknown as Response
  const error = await ApiError.fromResponse(response)
  expect(error.message).toBe('HTTP 502')
  expect(error.status).toBe(502)
})

test.each([
  [new ApiError('Bad Request', {}, 400), true],
  [new ApiError('Conflict', {}, 409), false],
  [new ApiError('Forbidden', {}, 403), true],
  [new ApiError('Too Large', {}, 413), true],
  [new ApiError('Unprocessable', {}, 422), true],
  [new ApiError('Network', {}, 0), false],
  [new ApiError('No status', {}), false],
  [new ApiError('Server error', {}, 500), false],
  [new ApiError('Gateway Timeout', {}, 504), false],
  [new Error('Unreadable'), false],
  [new DOMException('Cancelled', 'AbortError'), false],
])('isDefinitiveRejection(%p) is %p', (error, expected) => {
  expect(isDefinitiveRejection(error)).toBe(expected)
})

test.each([
  [new ApiError('Precondition Failed', {}, 412), true],
  [new ApiError('Precondition Required', {}, 428), true],
  [new ApiError('Conflict', {}, 409), false],
  [new ApiError('Bad Request', {}, 400), false],
  [new ApiError('No status', {}), false],
  [Object.assign(new Error('Plain'), { status: 412 }), false],
])('isStaleRevision(%p) is %p', (error, expected) => {
  expect(isStaleRevision(error)).toBe(expected)
})

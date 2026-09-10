import { ApiError } from 'http/ApiClient'

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
  type ErrorWithOptionalCapture = { captureStackTrace?: unknown }
  const errorConstructor = Error as unknown as ErrorWithOptionalCapture
  let originalCaptureStackTrace: unknown

  beforeEach(() => {
    originalCaptureStackTrace = errorConstructor.captureStackTrace
    delete errorConstructor.captureStackTrace
  })

  afterEach(() => {
    errorConstructor.captureStackTrace = originalCaptureStackTrace
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

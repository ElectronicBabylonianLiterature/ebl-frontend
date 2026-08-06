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
})

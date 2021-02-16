import { ApiError } from './ApiClient'

test.each([
  ['Description', { title: 'hide', description: 'Description' }],
  ['Title: {"key":"value"}', { title: 'Title', description: { key: 'value' } }],
  ['status: {"key":"value"}', { description: { key: 'value' } }],
  ['{"key":"value"}', { key: 'value' }],
])('bodyToMessage %s', (message, body) => {
  expect(ApiError.bodyToMessage(body, 'status')).toEqual(message)
})

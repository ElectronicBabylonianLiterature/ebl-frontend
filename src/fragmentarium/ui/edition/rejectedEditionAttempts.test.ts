import {
  createAttemptKey,
  createUpdatedFields,
  isDeterministicFailure,
  rememberRejectedAttempt,
} from 'fragmentarium/ui/edition/rejectedEditionAttempts'
import { ApiError } from 'http/ApiClient'

test.each([401, 408, 429, 399, 500, undefined])(
  'allows retry for status %p',
  (status) => {
    expect(isDeterministicFailure(new ApiError('failed', {}, status))).toBe(
      false,
    )
  },
)

test('allows retry after a network failure', () => {
  expect(isDeterministicFailure(new Error('Network unavailable'))).toBe(false)
})

test.each([400, 403, 404, 422])('records deterministic status %p', (status) => {
  expect(isDeterministicFailure(new ApiError('failed', {}, status))).toBe(true)
})

test('includes every field in attempt identity without delimiter collisions', () => {
  expect(
    createAttemptKey({ transliteration: 'a', notes: 'b', introduction: 'c' }),
  ).toBe('["a","b","c"]')
  expect(
    createAttemptKey({ transliteration: 'a,b', notes: '', introduction: 'c' }),
  ).not.toBe(
    createAttemptKey({ transliteration: 'a', notes: 'b,', introduction: 'c' }),
  )
})

test('includes only changed fields, including empty values', () => {
  const initial = { transliteration: 'a', notes: 'b', introduction: 'c' }
  expect(createUpdatedFields(initial, initial)).toEqual({})
  expect(
    createUpdatedFields(
      { ...initial, notes: '', introduction: 'changed' },
      initial,
    ),
  ).toEqual({ notes: '', introduction: 'changed' })
})

test('evicts the oldest of twenty remembered attempts and refreshes repeats', () => {
  const attempts = new Set(
    Array.from({ length: 20 }, (_, index) => String(index)),
  )
  const refreshed = rememberRejectedAttempt(attempts, '0')
  const next = rememberRejectedAttempt(refreshed, 'new')
  expect(next.size).toBe(20)
  expect(next.has('0')).toBe(true)
  expect(next.has('1')).toBe(false)
  expect(next.has('new')).toBe(true)
  expect(attempts.has('1')).toBe(true)
})

import { getPageIndexForOffset } from './pagination'

test('computes the page index from a valid offset and limit', () => {
  expect(getPageIndexForOffset(50, 25)).toEqual(2)
})

test('defaults to page 0 for a negative offset', () => {
  expect(getPageIndexForOffset(-1, 25)).toEqual(0)
})

test('defaults to page 0 for a non-integer offset', () => {
  expect(getPageIndexForOffset('not-a-number', 25)).toEqual(0)
})

test('defaults to page 0 when no offset is given', () => {
  expect(getPageIndexForOffset(undefined, 25)).toEqual(0)
})

import isNonNegativeInteger from 'common/utils/isNonNegativeInteger'

describe('isNonNegativeInteger', () => {
  it.each([0, 1, Number.MAX_SAFE_INTEGER])('accepts %s', (value) => {
    expect(isNonNegativeInteger(value)).toBe(true)
  })

  it.each([
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
    '1',
    null,
    undefined,
  ])('rejects %s', (value) => {
    expect(isNonNegativeInteger(value)).toBe(false)
  })
})

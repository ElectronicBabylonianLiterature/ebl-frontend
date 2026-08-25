import {
  boundArray,
  configuredIiifOrigins,
  hasResourceType,
  isAllowedOrigin,
  isRecord,
  maximumDisplayStringLength,
  normalizeAbsoluteHttpsUrl,
  normalizeAllowedUrl,
  normalizeDisplayString,
  normalizeNonEmptyString,
  normalizePositiveInteger,
  normalizeResourceId,
  normalizeResourceType,
  normalizeStrictStringArray,
  normalizeStringArray,
  toArray,
  toOrigin,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'
import {
  allowedOrigins,
  foreignOrigin,
  iiifOrigin,
  unsafeDataUrl,
  unsafeFileUrl,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

describe('isRecord', () => {
  test.each([
    [{}, true],
    [{ a: 1 }, true],
    [[], false],
    [null, false],
    [undefined, false],
    ['string', false],
    [1, false],
  ])('isRecord(%p) is %p', (value, expected) => {
    expect(isRecord(value)).toBe(expected)
  })
})

describe('toArray', () => {
  test.each([
    [
      [1, 2],
      [1, 2],
    ],
    ['a', ['a']],
    [undefined, []],
    [null, []],
  ])('toArray(%p)', (value, expected) => {
    expect(toArray(value)).toEqual(expected)
  })
})

test('boundArray truncates beyond the limit', () => {
  expect(boundArray([1, 2, 3], 2)).toEqual([1, 2])
  expect(boundArray([1, 2], 5)).toEqual([1, 2])
})

describe('normalizeNonEmptyString', () => {
  test.each([
    [' value ', 'value'],
    ['   ', undefined],
    ['', undefined],
    [1, undefined],
    [null, undefined],
  ])('normalizeNonEmptyString(%p) is %p', (value, expected) => {
    expect(normalizeNonEmptyString(value)).toBe(expected)
  })
})

test('normalizeDisplayString truncates over-long text', () => {
  const long = 'a'.repeat(maximumDisplayStringLength + 10)
  expect(normalizeDisplayString(long)).toHaveLength(maximumDisplayStringLength)
  expect(normalizeDisplayString('short')).toBe('short')
  expect(normalizeDisplayString('  ')).toBeUndefined()
})

describe('normalizePositiveInteger', () => {
  test.each([
    [10, 10],
    [0, undefined],
    [-1, undefined],
    [1.5, undefined],
    [Number.NaN, undefined],
    [Number.POSITIVE_INFINITY, undefined],
    ['10', undefined],
  ])('normalizePositiveInteger(%p) is %p', (value, expected) => {
    expect(normalizePositiveInteger(value)).toBe(expected)
  })
})

describe('normalizeAbsoluteHttpsUrl', () => {
  test.each([
    [`${iiifOrigin}/manifest`, `${iiifOrigin}/manifest`],
    ['http://example.com/manifest', undefined],
    [unsafeScriptUrl, undefined],
    [unsafeDataUrl, undefined],
    [unsafeFileUrl, undefined],
    ['blob:https://example.com/id', undefined],
    ['/relative/path', undefined],
    ['not a url', undefined],
    [42, undefined],
  ])('normalizeAbsoluteHttpsUrl(%p) is %p', (value, expected) => {
    expect(normalizeAbsoluteHttpsUrl(value)).toBe(expected)
  })
})

test('toOrigin resolves https origins only', () => {
  expect(toOrigin(`${iiifOrigin}/a/b`)).toBe(iiifOrigin)
  expect(toOrigin('http://example.com')).toBeUndefined()
  expect(toOrigin('nonsense')).toBeUndefined()
})

test('isAllowedOrigin enforces the allowlist', () => {
  expect(isAllowedOrigin(`${iiifOrigin}/a`, allowedOrigins)).toBe(true)
  expect(isAllowedOrigin(`${foreignOrigin}/a`, allowedOrigins)).toBe(false)
  expect(isAllowedOrigin('nonsense', allowedOrigins)).toBe(false)
})

test('normalizeAllowedUrl combines scheme and origin checks', () => {
  expect(normalizeAllowedUrl(`${iiifOrigin}/a`, allowedOrigins)).toBe(
    `${iiifOrigin}/a`,
  )
  expect(
    normalizeAllowedUrl(`${foreignOrigin}/a`, allowedOrigins),
  ).toBeUndefined()
  expect(normalizeAllowedUrl(unsafeScriptUrl, allowedOrigins)).toBeUndefined()
})

describe('configuredIiifOrigins', () => {
  const original = process.env.REACT_APP_DICTIONARY_API_URL

  afterEach(() => {
    process.env.REACT_APP_DICTIONARY_API_URL = original
  })

  test('uses the configured https API origin', () => {
    process.env.REACT_APP_DICTIONARY_API_URL = `${iiifOrigin}/api`
    expect(configuredIiifOrigins()).toEqual([iiifOrigin])
  })

  test('allows nothing when the API is not https', () => {
    process.env.REACT_APP_DICTIONARY_API_URL = 'http://example.com'
    expect(configuredIiifOrigins()).toEqual([])
  })

  test('allows nothing when the API url is unset', () => {
    delete process.env.REACT_APP_DICTIONARY_API_URL
    expect(configuredIiifOrigins()).toEqual([])
  })
})

test('normalizeResourceId reads id and @id', () => {
  expect(normalizeResourceId({ id: `${iiifOrigin}/a` })).toBe(`${iiifOrigin}/a`)
  expect(normalizeResourceId({ '@id': `${iiifOrigin}/b` })).toBe(
    `${iiifOrigin}/b`,
  )
  expect(normalizeResourceId(`${iiifOrigin}/c`)).toBe(`${iiifOrigin}/c`)
  expect(normalizeResourceId({})).toBeUndefined()
})

test('normalizeResourceType reads type and @type', () => {
  expect(normalizeResourceType({ type: 'Manifest' })).toBe('Manifest')
  expect(normalizeResourceType({ '@type': 'sc:Manifest' })).toBe('sc:Manifest')
  expect(normalizeResourceType({ type: 1 })).toBeUndefined()
  expect(normalizeResourceType('Manifest')).toBeUndefined()
  expect(hasResourceType({ type: 'Canvas' }, 'Canvas')).toBe(true)
  expect(hasResourceType({ type: 'Canvas' }, 'Manifest')).toBe(false)
})

test('normalizeStringArray keeps only non-empty strings', () => {
  expect(normalizeStringArray(['a', '', 1, null, ' b '])).toEqual(['a', 'b'])
  expect(normalizeStringArray('single')).toEqual(['single'])
  expect(normalizeStringArray(undefined)).toEqual([])
})

test('normalizeStrictStringArray rejects non-array values', () => {
  expect(normalizeStrictStringArray(['a', 'b'])).toEqual(['a', 'b'])
  expect(normalizeStrictStringArray('single')).toEqual([])
  expect(normalizeStrictStringArray(undefined)).toEqual([])
})

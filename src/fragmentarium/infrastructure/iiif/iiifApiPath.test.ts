import {
  configuredApiBaseUrl,
  toApiPath,
} from 'fragmentarium/infrastructure/iiif/iiifApiPath'
import {
  allowedOrigins,
  foreignOrigin,
  iiifOrigin,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

test('resolves a path relative to the configured base url', () => {
  expect(
    toApiPath(
      `${iiifOrigin}/presentation/K.1/manifest`,
      allowedOrigins,
      iiifOrigin,
    ),
  ).toBe('/presentation/K.1/manifest')
})

test('tolerates a trailing slash on the base url', () => {
  expect(
    toApiPath(`${iiifOrigin}/manifest`, allowedOrigins, `${iiifOrigin}/`),
  ).toBe('/manifest')
})

test('resolves a path when the base url has a prefix', () => {
  expect(
    toApiPath(
      `${iiifOrigin}/api/iiif/manifest`,
      allowedOrigins,
      `${iiifOrigin}/api`,
    ),
  ).toBe('/iiif/manifest')
})

test.each([
  ['a foreign origin', `${foreignOrigin}/manifest`, iiifOrigin],
  ['a non-https url', 'http://iiif.example.com/manifest', iiifOrigin],
  ['a javascript url', unsafeScriptUrl, iiifOrigin],
  [
    'a url outside the base path',
    `${iiifOrigin}/other/manifest`,
    `${iiifOrigin}/api`,
  ],
  ['an unset base url', `${iiifOrigin}/manifest`, ''],
])('returns undefined for %s', (unused, url, baseUrl) => {
  expect(toApiPath(url, allowedOrigins, baseUrl)).toBeUndefined()
})

test('normalizes the origin root to a root path', () => {
  expect(toApiPath(iiifOrigin, allowedOrigins, iiifOrigin)).toBe('/')
})

test('reads the configured api base url', () => {
  const original = process.env.REACT_APP_DICTIONARY_API_URL
  process.env.REACT_APP_DICTIONARY_API_URL = iiifOrigin
  try {
    expect(configuredApiBaseUrl()).toBe(iiifOrigin)
    expect(toApiPath(`${iiifOrigin}/manifest`, allowedOrigins)).toBe(
      '/manifest',
    )
  } finally {
    process.env.REACT_APP_DICTIONARY_API_URL = original
  }
})

test('returns an empty base url when unset', () => {
  const original = process.env.REACT_APP_DICTIONARY_API_URL
  delete process.env.REACT_APP_DICTIONARY_API_URL
  try {
    expect(configuredApiBaseUrl()).toBe('')
  } finally {
    process.env.REACT_APP_DICTIONARY_API_URL = original
  }
})

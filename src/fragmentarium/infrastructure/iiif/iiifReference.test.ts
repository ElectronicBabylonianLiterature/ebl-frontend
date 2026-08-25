import {
  normalizeFragmentIiifReference,
  normalizeIiifReference,
} from 'fragmentarium/infrastructure/iiif/iiifReference'
import {
  allowedOrigins,
  foreignOrigin,
  iiifOrigin,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

const manifest = `${iiifOrigin}/presentation/K.1/manifest`

test('normalizes a version 3 reference', () => {
  expect(
    normalizeIiifReference({ manifest, version: '3' }, allowedOrigins),
  ).toEqual({ manifestUrl: manifest, presentationVersion: '3' })
})

test('accepts a reference without an explicit version', () => {
  expect(normalizeIiifReference({ manifest }, allowedOrigins)).toEqual({
    manifestUrl: manifest,
    presentationVersion: '3',
  })
})

test.each([
  ['is missing', undefined],
  ['is null', null],
  ['is not a record', 'https://example.com/manifest'],
  ['is an array', [{ manifest }]],
  ['has no manifest', {}],
  ['has a non-string manifest', { manifest: 42 }],
  ['has an unsupported version', { manifest, version: '2' }],
  ['has a numeric version', { manifest, version: 3 }],
  ['is not https', { manifest: 'http://iiif.example.com/manifest' }],
  ['is javascript', { manifest: unsafeScriptUrl }],
  ['is a foreign origin', { manifest: `${foreignOrigin}/manifest` }],
])('rejects a reference that %s', (unused, value) => {
  expect(normalizeIiifReference(value, allowedOrigins)).toBeUndefined()
})

test('reads the reference from a fragment dto', () => {
  expect(
    normalizeFragmentIiifReference({ iiif: { manifest } }, allowedOrigins),
  ).toEqual({ manifestUrl: manifest, presentationVersion: '3' })
  expect(normalizeFragmentIiifReference({}, allowedOrigins)).toBeUndefined()
})

test('falls back to the configured origins', () => {
  const original = process.env.REACT_APP_DICTIONARY_API_URL
  process.env.REACT_APP_DICTIONARY_API_URL = iiifOrigin
  try {
    const expected = { manifestUrl: manifest, presentationVersion: '3' }
    expect(normalizeIiifReference({ manifest })).toEqual(expected)
    expect(normalizeFragmentIiifReference({ iiif: { manifest } })).toEqual(
      expected,
    )
  } finally {
    process.env.REACT_APP_DICTIONARY_API_URL = original
  }
})

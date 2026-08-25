import {
  MediaEndpointResult,
  resolveFragmentMedia,
} from 'fragmentarium/domain/mediaSource'
import { IiifReference } from 'fragmentarium/domain/iiifDocument'
import { ManifestFetchResult } from 'fragmentarium/domain/iiifResult'
import { normalizeManifest } from 'fragmentarium/infrastructure/iiif/iiifManifestAdapter'
import {
  allowedOrigins,
  iiifOrigin,
  manifestFixture,
  manifestWithoutImageServiceFixture,
} from 'test-support/iiif-fixtures/iiifFixtures'
import { createMediaResource } from 'test-support/media-fixtures'

const endpointMedia = [createMediaResource({}, 'media-id')]

const mediaEndpoint: MediaEndpointResult = {
  status: 'ok',
  media: endpointMedia,
}

const iiif: IiifReference = {
  manifestUrl: `${iiifOrigin}/presentation/K.1/manifest`,
  presentationVersion: '3',
}

function manifestResult(value: unknown): ManifestFetchResult {
  return normalizeManifest(value, allowedOrigins)
}

test('prefers a usable manifest', () => {
  const manifest = manifestResult(manifestFixture())
  const resolved = resolveFragmentMedia({ iiif, manifest, hasPhoto: true })
  expect(resolved.source).toBe('iiif')
  expect(resolved.media).toHaveLength(1)
  expect(resolved.document?.manifestId).toBe(iiif.manifestUrl)
  expect(resolved.fallback).toBeUndefined()
})

test('uses a degraded manifest', () => {
  const manifest = manifestResult(manifestWithoutImageServiceFixture())
  expect(manifest.status).toBe('degraded')
  expect(resolveFragmentMedia({ iiif, manifest, hasPhoto: true }).source).toBe(
    'iiif',
  )
})

test('falls back to the legacy photo when there is no reference', () => {
  expect(resolveFragmentMedia({ hasPhoto: true })).toEqual({
    source: 'legacy-photo',
    media: [],
    fallback: { reason: 'NO_IIIF_REFERENCE', source: 'legacy-photo' },
  })
})

test('falls back when a reference has no fetched manifest yet', () => {
  expect(resolveFragmentMedia({ iiif, hasPhoto: true }).fallback?.reason).toBe(
    'NO_IIIF_REFERENCE',
  )
})

test('reports no media when there is no photo either', () => {
  expect(resolveFragmentMedia({ hasPhoto: false })).toEqual({
    source: 'none',
    media: [],
    fallback: { reason: 'NO_IIIF_REFERENCE', source: 'none' },
  })
})

test.each([
  ['MANIFEST_INVALID', { status: 'invalid', reason: 'NO_CANVASES' }],
  [
    'MANIFEST_UNAUTHORIZED',
    {
      status: 'unauthorized',
      challenge: { kind: 'http-403', message: 'no', canRetryAfterLogin: false },
    },
  ],
  ['MANIFEST_UNAVAILABLE', { status: 'not-found' }],
  ['MANIFEST_UNAVAILABLE', { status: 'network-error', retryable: true }],
  ['MANIFEST_UNAVAILABLE', { status: 'unavailable' }],
])('demotes to legacy with reason %s', (reason, manifest) => {
  const resolved = resolveFragmentMedia({
    iiif,
    manifest: manifest as ManifestFetchResult,
    hasPhoto: true,
  })
  expect(resolved.source).toBe('legacy-photo')
  expect(resolved.fallback).toEqual({ reason, source: 'legacy-photo' })
})

test('keeps IIIF above a usable media endpoint', () => {
  const manifest = manifestResult(manifestFixture())
  const resolved = resolveFragmentMedia({
    iiif,
    manifest,
    mediaEndpoint,
    hasPhoto: true,
  })
  expect(resolved.source).toBe('iiif')
  expect(resolved.fallback).toBeUndefined()
})

test('demotes an unusable manifest to the media endpoint', () => {
  const resolved = resolveFragmentMedia({
    iiif,
    manifest: { status: 'not-found' },
    mediaEndpoint,
    hasPhoto: true,
  })
  expect(resolved.source).toBe('media-endpoint')
  expect(resolved.media).toEqual(endpointMedia)
  expect(resolved.fallback).toEqual({
    reason: 'MANIFEST_UNAVAILABLE',
    source: 'media-endpoint',
  })
})

test('uses the media endpoint when there is no IIIF reference', () => {
  expect(resolveFragmentMedia({ mediaEndpoint, hasPhoto: true }).source).toBe(
    'media-endpoint',
  )
})

test.each([
  ['MEDIA_INVALID', { status: 'invalid' } as MediaEndpointResult],
  ['MEDIA_UNAVAILABLE', { status: 'unavailable' } as MediaEndpointResult],
  ['MEDIA_EMPTY', { status: 'empty' } as MediaEndpointResult],
  ['MEDIA_EMPTY', { status: 'ok', media: [] } as MediaEndpointResult],
])(
  'demotes an unusable media endpoint to legacy with reason %s',
  (mediaEndpointReason, unusableEndpoint) => {
    const resolved = resolveFragmentMedia({
      mediaEndpoint: unusableEndpoint,
      hasPhoto: true,
    })
    expect(resolved.source).toBe('legacy-photo')
    expect(resolved.fallback).toEqual({
      reason: 'NO_IIIF_REFERENCE',
      source: 'legacy-photo',
      mediaEndpointReason,
    })
  },
)

test('reports no media when neither the endpoint nor a photo is usable', () => {
  expect(
    resolveFragmentMedia({
      mediaEndpoint: { status: 'unavailable' },
      hasPhoto: false,
    }),
  ).toEqual({
    source: 'none',
    media: [],
    fallback: {
      reason: 'NO_IIIF_REFERENCE',
      source: 'none',
      mediaEndpointReason: 'MEDIA_UNAVAILABLE',
    },
  })
})

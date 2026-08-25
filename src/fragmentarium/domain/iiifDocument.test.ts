import {
  isDegraded,
  selectMediaById,
  selectPrimaryMedia,
} from 'fragmentarium/domain/iiifDocument'
import {
  hasImageService,
  IiifMediaResource,
  selectImageService,
} from 'fragmentarium/domain/iiifMedia'
import {
  isUsableManifest,
  ManifestFetchResult,
  selectDocument,
} from 'fragmentarium/domain/iiifResult'
import { isImageComplianceLevel } from 'fragmentarium/domain/mediaImageService'
import { normalizeManifest } from 'fragmentarium/infrastructure/iiif/iiifManifestAdapter'
import {
  allowedOrigins,
  iiifOrigin,
  manifestFixture,
  manifestWithoutImageServiceFixture,
  multiCanvasManifestFixture,
} from 'test-support/iiif-fixtures/iiifFixtures'

function document(value: unknown) {
  const result = normalizeManifest(value, allowedOrigins)
  if (result.status === 'invalid') {
    throw new Error(`unexpected invalid manifest: ${result.reason}`)
  }
  return result.document
}

test('selects media by canvas id', () => {
  const multiCanvas = document(multiCanvasManifestFixture(3))
  expect(
    selectMediaById(multiCanvas, `${iiifOrigin}/canvas/1`)?.sortOrder,
  ).toBe(1)
  expect(
    selectMediaById(multiCanvas, 'https://example.com/missing'),
  ).toBeUndefined()
})

test('selects the primary media', () => {
  const multiCanvas = document(multiCanvasManifestFixture(3))
  expect(selectPrimaryMedia(multiCanvas)?.id).toBe(`${iiifOrigin}/canvas/0`)
})

test('falls back to the first media when none is primary', () => {
  const [first, ...rest] = document(multiCanvasManifestFixture(2)).media
  const media: readonly IiifMediaResource[] = [
    { ...first, isPrimary: false },
    ...rest,
  ]
  expect(
    selectPrimaryMedia({ ...document(manifestFixture()), media })?.id,
  ).toBe(`${iiifOrigin}/canvas/0`)
})

test('reports whether a document is degraded', () => {
  expect(isDegraded(document(manifestFixture()))).toBe(false)
  expect(isDegraded(document(manifestWithoutImageServiceFixture()))).toBe(true)
})

test('reports whether media has an image service', () => {
  const withService = document(manifestFixture()).media[0]
  const withoutService = document(manifestWithoutImageServiceFixture()).media[0]
  expect(hasImageService(withService)).toBe(true)
  expect(selectImageService(withService)?.id).toBe(`${iiifOrigin}/image/K.1`)
  expect(hasImageService(withoutService)).toBe(false)
  expect(selectImageService(withoutService)).toBeUndefined()
})

describe('manifest fetch results', () => {
  const ok = normalizeManifest(manifestFixture(), allowedOrigins)
  const degraded = normalizeManifest(
    manifestWithoutImageServiceFixture(),
    allowedOrigins,
  )

  test.each([
    ['ok', ok as ManifestFetchResult, true],
    ['degraded', degraded as ManifestFetchResult, true],
    [
      'invalid',
      { status: 'invalid', reason: 'NO_CANVASES' } as ManifestFetchResult,
      false,
    ],
    ['not-found', { status: 'not-found' } as ManifestFetchResult, false],
    ['unavailable', { status: 'unavailable' } as ManifestFetchResult, false],
  ])('isUsableManifest is %p aware', (unused, result, expected) => {
    expect(isUsableManifest(result)).toBe(expected)
    expect(selectDocument(result) !== undefined).toBe(expected)
  })
})

test.each([
  ['level0', true],
  ['level1', true],
  ['level2', true],
  ['level3', false],
  [2, false],
  [undefined, false],
])('isImageComplianceLevel(%p) is %p', (value, expected) => {
  expect(isImageComplianceLevel(value)).toBe(expected)
})

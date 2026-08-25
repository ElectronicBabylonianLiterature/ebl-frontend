import { normalizeManifest } from 'fragmentarium/infrastructure/iiif/iiifManifestAdapter'
import {
  isDegraded,
  selectPrimaryMedia,
} from 'fragmentarium/domain/iiifDocument'
import {
  allowedOrigins,
  canvasFixture,
  foreignOrigin,
  iiifOrigin,
  imageBodyFixture,
  localizedManifestFixture,
  manifestFixture,
  manifestWithoutImageServiceFixture,
  multiCanvasManifestFixture,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

function expectInvalid(value: unknown, reason: string): void {
  const result = normalizeManifest(value, allowedOrigins)
  expect(result).toEqual({ status: 'invalid', reason })
}

test('normalizes a minimal single-image manifest', () => {
  const result = normalizeManifest(manifestFixture(), allowedOrigins)
  expect(result.status).toBe('ok')
  const document = result.status === 'ok' ? result.document : undefined
  expect(document).toMatchObject({
    manifestId: `${iiifOrigin}/presentation/K.1/manifest`,
    label: 'K.1',
    summary: 'A cuneiform fragment',
    metadata: [{ label: 'Museum', value: 'British Museum' }],
    requiredStatement: {
      label: 'Attribution',
      value: 'Trustees of the British Museum',
    },
    rights: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    homepage: 'https://www.britishmuseum.org/K.1',
    diagnostics: [],
  })
  expect(document?.provider).toEqual([
    {
      id: `${iiifOrigin}/provider`,
      label: 'Electronic Babylonian Library',
      homepage: 'https://www.ebl.lmu.de/',
    },
  ])
  expect(document?.media).toHaveLength(1)
  expect(isDegraded(document!)).toBe(false)
})

test('preserves canvas order in a multi-canvas manifest', () => {
  const result = normalizeManifest(
    multiCanvasManifestFixture(3),
    allowedOrigins,
  )
  const document = result.status === 'ok' ? result.document : undefined
  expect(document?.media.map((media) => media.id)).toEqual([
    `${iiifOrigin}/canvas/0`,
    `${iiifOrigin}/canvas/1`,
    `${iiifOrigin}/canvas/2`,
  ])
  expect(selectPrimaryMedia(document!)?.id).toBe(`${iiifOrigin}/canvas/0`)
})

test('degrades when a canvas has no image service', () => {
  const result = normalizeManifest(
    manifestWithoutImageServiceFixture(),
    allowedOrigins,
  )
  expect(result.status).toBe('degraded')
  if (result.status === 'degraded') {
    expect(result.diagnostics).toEqual([
      { code: 'MISSING_IMAGE_SERVICE', detail: `${iiifOrigin}/canvas/0` },
    ])
    expect(isDegraded(result.document)).toBe(true)
  }
})

test('degrades when one canvas is dropped but another survives', () => {
  const manifest = manifestFixture({
    items: [
      canvasFixture(0, { id: `${foreignOrigin}/canvas/0` }),
      canvasFixture(1),
    ],
  })
  const result = normalizeManifest(manifest, allowedOrigins)
  expect(result.status).toBe('degraded')
  if (result.status === 'degraded') {
    expect(result.document.media).toHaveLength(1)
    expect(result.document.media[0].sortOrder).toBe(0)
    expect(result.document.media[0].isPrimary).toBe(true)
    expect(result.diagnostics[0].code).toBe('CANVAS_DROPPED')
  }
})

test('resolves localized descriptive properties', () => {
  const result = normalizeManifest(localizedManifestFixture(), allowedOrigins)
  const document = result.status === 'ok' ? result.document : undefined
  expect(document?.label).toBe('K.1')
  expect(document?.metadata).toEqual([
    { label: 'Collection', value: 'Kuyunjik\nNineveh' },
  ])
})

test.each([
  ['NOT_AN_OBJECT', 'not an object'],
  ['NOT_AN_OBJECT', null],
  ['NOT_AN_OBJECT', []],
  ['WRONG_TYPE', { type: 'Collection' }],
  ['WRONG_TYPE', { ...manifestFixture(), type: undefined }],
])('rejects a manifest with %s', (reason, value) => {
  expectInvalid(value, reason)
})

test('rejects a Presentation 2 context', () => {
  expectInvalid(
    manifestFixture({
      '@context': 'http://iiif.io/api/presentation/2/context.json',
    }),
    'UNSUPPORTED_PRESENTATION_VERSION',
  )
})

test('accepts a context array containing Presentation 3', () => {
  const result = normalizeManifest(
    manifestFixture({
      '@context': [
        'http://www.w3.org/ns/anno.jsonld',
        'http://iiif.io/api/presentation/3/context.json',
      ],
    }),
    allowedOrigins,
  )
  expect(result.status).toBe('ok')
})

test('accepts a manifest with no context', () => {
  const result = normalizeManifest(
    manifestFixture({ '@context': undefined }),
    allowedOrigins,
  )
  expect(result.status).toBe('ok')
})

test('rejects a manifest without a usable id', () => {
  expectInvalid(manifestFixture({ id: undefined }), 'MISSING_ID')
  expectInvalid(manifestFixture({ id: unsafeScriptUrl }), 'MISSING_ID')
})

test('rejects an externally hosted manifest', () => {
  expectInvalid(
    manifestFixture({ id: `${foreignOrigin}/manifest` }),
    'REJECTED_ORIGIN',
  )
})

test('rejects a manifest with no usable canvases', () => {
  expectInvalid(manifestFixture({ items: [] }), 'NO_CANVASES')
  expectInvalid(manifestFixture({ items: undefined }), 'NO_CANVASES')
  expectInvalid(
    manifestFixture({
      items: [
        canvasFixture(0, {
          items: [
            {
              type: 'AnnotationPage',
              items: [
                {
                  type: 'Annotation',
                  motivation: 'painting',
                  body: imageBodyFixture({ format: 'image/svg+xml' }),
                },
              ],
            },
          ],
        }),
      ],
    }),
    'NO_CANVASES',
  )
})

test('omits absent descriptive properties', () => {
  const result = normalizeManifest(
    manifestFixture({
      label: undefined,
      summary: undefined,
      requiredStatement: undefined,
      rights: undefined,
      homepage: undefined,
      metadata: undefined,
      provider: undefined,
    }),
    allowedOrigins,
  )
  expect(result.status).toBe('ok')
  const document = result.status === 'ok' ? result.document : undefined
  expect(document).not.toHaveProperty('label')
  expect(document).not.toHaveProperty('summary')
  expect(document).not.toHaveProperty('requiredStatement')
  expect(document).not.toHaveProperty('rights')
  expect(document).not.toHaveProperty('homepage')
  expect(document?.metadata).toEqual([])
  expect(document?.provider).toEqual([])
})

test('falls back to the configured origins', () => {
  const original = process.env.REACT_APP_DICTIONARY_API_URL
  process.env.REACT_APP_DICTIONARY_API_URL = iiifOrigin
  try {
    expect(normalizeManifest(manifestFixture()).status).toBe('ok')
  } finally {
    process.env.REACT_APP_DICTIONARY_API_URL = original
  }
})

test('rejects a manifest with too many canvases', () => {
  expectInvalid(
    manifestFixture({
      items: Array.from({ length: 501 }, (unused, index) =>
        canvasFixture(index),
      ),
    }),
    'TOO_MANY_CANVASES',
  )
})

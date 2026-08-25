import { normalizeCanvas } from 'fragmentarium/infrastructure/iiif/iiifCanvasAdapter'
import {
  allowedOrigins,
  canvasFixture,
  foreignOrigin,
  iiifOrigin,
  imageBodyFixture,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

function paintingCanvas(body: unknown): Record<string, unknown> {
  return canvasFixture(0, {
    items: [
      {
        type: 'AnnotationPage',
        items: [{ type: 'Annotation', motivation: 'painting', body }],
      },
    ],
  })
}

test('maps a canvas onto a media resource', () => {
  const { media, diagnostics } = normalizeCanvas(
    canvasFixture(0),
    0,
    allowedOrigins,
  )
  expect(diagnostics).toEqual([])
  expect(media).toMatchObject({
    id: `${iiifOrigin}/canvas/0`,
    sortOrder: 0,
    isPrimary: true,
    label: 'Obverse 0',
    canvasWidth: 4000,
    canvasHeight: 3000,
    references: [],
  })
  expect(media?.representations.original).toEqual({
    url: `${iiifOrigin}/image/K.1/full/max/0/default.jpg`,
    mimeType: 'image/jpeg',
    width: 4000,
    height: 3000,
  })
  expect(media?.representations.imageService?.id).toBe(
    `${iiifOrigin}/image/K.1`,
  )
  expect(media?.representations.thumbnails).toEqual({})
})

test('keeps manifest order and marks only the first canvas primary', () => {
  const { media } = normalizeCanvas(canvasFixture(2), 3, allowedOrigins)
  expect(media?.sortOrder).toBe(3)
  expect(media?.isPrimary).toBe(false)
})

test('keeps a canvas without an image service and reports it', () => {
  const { media, diagnostics } = normalizeCanvas(
    paintingCanvas(imageBodyFixture({ service: undefined })),
    0,
    allowedOrigins,
  )
  expect(media?.representations.imageService).toBeUndefined()
  expect(diagnostics).toEqual([
    { code: 'MISSING_IMAGE_SERVICE', detail: `${iiifOrigin}/canvas/0` },
  ])
})

test.each([
  ['not a record', 'string'],
  ['not a Canvas', canvasFixture(0, { type: 'Manifest' })],
  ['a foreign id', canvasFixture(0, { id: `${foreignOrigin}/canvas/0` })],
  ['a missing id', canvasFixture(0, { id: undefined })],
])('drops a canvas that is %s', (unused, value) => {
  const { media, diagnostics } = normalizeCanvas(value, 0, allowedOrigins)
  expect(media).toBeUndefined()
  expect(diagnostics[0].code).toBe('CANVAS_DROPPED')
})

test.each([
  [
    'a video body',
    { type: 'Video', id: `${iiifOrigin}/v.mp4`, format: 'video/mp4' },
  ],
  ['an svg body', imageBodyFixture({ format: 'image/svg+xml' })],
  ['a body without a format', imageBodyFixture({ format: undefined })],
  [
    'a body on a foreign origin',
    imageBodyFixture({ id: `${foreignOrigin}/i.jpg` }),
  ],
  [
    'a body with a data url',
    imageBodyFixture({ id: 'data:image/png;base64,AAA' }),
  ],
  ['no painting annotation', undefined],
])('reports an unsupported body: %s', (unused, body) => {
  const { media, diagnostics } = normalizeCanvas(
    paintingCanvas(body),
    0,
    allowedOrigins,
  )
  expect(media).toBeUndefined()
  expect(diagnostics[0].code).toBe('UNSUPPORTED_BODY')
})

test('ignores non-painting annotations', () => {
  const canvas = canvasFixture(0, {
    items: [
      {
        type: 'AnnotationPage',
        items: [
          {
            type: 'Annotation',
            motivation: 'commenting',
            body: imageBodyFixture(),
          },
        ],
      },
    ],
  })
  expect(normalizeCanvas(canvas, 0, allowedOrigins).media).toBeUndefined()
})

test('normalizes thumbnails and renderings', () => {
  const canvas = canvasFixture(0, {
    thumbnail: [
      { id: unsafeScriptUrl, type: 'Image', format: 'image/jpeg' },
      {
        id: `${iiifOrigin}/thumb.jpg`,
        type: 'Image',
        format: 'image/jpeg',
        width: 100,
        height: 75,
      },
    ],
    rendering: [
      {
        id: `${iiifOrigin}/K.1.tif`,
        type: 'Image',
        label: { en: ['TIFF'] },
        format: 'image/tiff',
      },
      { id: `${foreignOrigin}/bad.pdf`, label: { en: ['Bad'] } },
      { id: `${iiifOrigin}/unlabelled.tif` },
    ],
  })
  const { media } = normalizeCanvas(canvas, 0, allowedOrigins)
  expect(media?.representations.thumbnail).toEqual({
    url: `${iiifOrigin}/thumb.jpg`,
    mimeType: 'image/jpeg',
    width: 100,
    height: 75,
  })
  expect(media?.renderings).toEqual([
    { id: `${iiifOrigin}/K.1.tif`, label: 'TIFF', format: 'image/tiff' },
  ])
})

test('reads bodies, thumbnails and renderings identified by @id', () => {
  const canvas = canvasFixture(0, {
    items: [
      {
        type: 'AnnotationPage',
        items: [
          {
            type: 'Annotation',
            motivation: 'painting',
            body: {
              '@id': `${iiifOrigin}/image/legacy.jpg`,
              type: 'Image',
              format: 'image/jpeg',
            },
          },
        ],
      },
    ],
    thumbnail: [{ '@id': `${iiifOrigin}/thumb.png`, format: 'image/png' }],
    rendering: [{ '@id': `${iiifOrigin}/K.1.tif`, label: { en: ['TIFF'] } }],
  })
  const { media } = normalizeCanvas(canvas, 0, allowedOrigins)
  expect(media?.representations.original.url).toBe(
    `${iiifOrigin}/image/legacy.jpg`,
  )
  expect(media?.representations.thumbnail?.url).toBe(`${iiifOrigin}/thumb.png`)
  expect(media?.renderings).toEqual([
    { id: `${iiifOrigin}/K.1.tif`, label: 'TIFF' },
  ])
})

test('skips non-record thumbnail and rendering entries', () => {
  const canvas = canvasFixture(0, {
    thumbnail: [
      'not a record',
      { id: `${iiifOrigin}/thumb.jpg`, format: 'image/png' },
    ],
    rendering: ['not a record'],
  })
  const { media } = normalizeCanvas(canvas, 0, allowedOrigins)
  expect(media?.representations.thumbnail?.mimeType).toBe('image/png')
  expect(media?.renderings).toBeUndefined()
})

test('omits absent optional properties', () => {
  const canvas = canvasFixture(0, {
    label: undefined,
    width: undefined,
    height: undefined,
    thumbnail: undefined,
    rendering: undefined,
  })
  const { media } = normalizeCanvas(canvas, 0, allowedOrigins)
  expect(media).not.toHaveProperty('label')
  expect(media).not.toHaveProperty('canvasWidth')
  expect(media).not.toHaveProperty('canvasHeight')
  expect(media).not.toHaveProperty('renderings')
  expect(media?.representations).not.toHaveProperty('thumbnail')
})

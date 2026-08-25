import {
  imageInfoUrl,
  normalizeImageService,
  selectImageServiceFromBody,
} from 'fragmentarium/infrastructure/iiif/iiifImageService'
import {
  supportsArbitraryRegions,
  supportsArbitrarySizes,
} from 'fragmentarium/domain/mediaImageService'
import {
  allowedOrigins,
  foreignOrigin,
  iiifOrigin,
  imageServiceFixture,
  level0ImageServiceFixture,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

test('normalizes a level 2 ImageService3', () => {
  expect(normalizeImageService(imageServiceFixture(), allowedOrigins)).toEqual({
    id: `${iiifOrigin}/image/K.1`,
    serviceType: 'ImageService3',
    complianceLevel: 'level2',
    width: 4000,
    height: 3000,
    tiles: [{ width: 512, height: 512, scaleFactors: [1, 2, 4, 8] }],
    sizes: [{ width: 500, height: 375 }],
  })
})

test('normalizes a level 0 service without tiles', () => {
  const service = normalizeImageService(
    level0ImageServiceFixture(),
    allowedOrigins,
  )
  expect(service?.complianceLevel).toBe('level0')
  expect(service?.tiles).toBeUndefined()
  expect(supportsArbitraryRegions(service!)).toBe(false)
  expect(supportsArbitrarySizes(service!)).toBe(false)
})

test('reports level 1 and level 2 capabilities', () => {
  const level1 = normalizeImageService(
    imageServiceFixture({ profile: 'level1' }),
    allowedOrigins,
  )
  expect(supportsArbitraryRegions(level1!)).toBe(true)
  expect(supportsArbitrarySizes(level1!)).toBe(false)
  const level2 = normalizeImageService(imageServiceFixture(), allowedOrigins)
  expect(supportsArbitrarySizes(level2!)).toBe(true)
})

test('reads a level from a IIIF profile URI', () => {
  const service = normalizeImageService(
    imageServiceFixture({
      profile: 'http://iiif.io/api/image/2/level1.json',
      type: 'ImageService2',
    }),
    allowedOrigins,
  )
  expect(service?.complianceLevel).toBe('level1')
  expect(service?.serviceType).toBe('ImageService2')
})

test.each([['unknown'], [42], [undefined], [null], [{ level: 2 }]])(
  'omits an unusable profile: %p',
  (profile) => {
    const service = normalizeImageService(
      imageServiceFixture({ profile }),
      allowedOrigins,
    )
    expect(service?.complianceLevel).toBeUndefined()
  },
)

test('normalizes optional maximum dimensions', () => {
  const service = normalizeImageService(
    imageServiceFixture({ maxWidth: 2000, maxHeight: 1500, maxArea: 3000000 }),
    allowedOrigins,
  )
  expect(service).toMatchObject({
    maxWidth: 2000,
    maxHeight: 1500,
    maxArea: 3000000,
  })
})

test.each([
  ['not a record', 'string'],
  ['an unsupported service type', imageServiceFixture({ type: 'AuthProbe' })],
  ['a missing type', imageServiceFixture({ type: undefined })],
  ['a foreign origin', imageServiceFixture({ id: `${foreignOrigin}/image` })],
  ['a javascript id', imageServiceFixture({ id: unsafeScriptUrl })],
  ['a missing id', imageServiceFixture({ id: undefined })],
])('rejects %s', (unused, value) => {
  expect(normalizeImageService(value, allowedOrigins)).toBeUndefined()
})

test('normalizes tiles without an explicit height', () => {
  const service = normalizeImageService(
    imageServiceFixture({ tiles: [{ width: 256, scaleFactors: [1, 2] }] }),
    allowedOrigins,
  )
  expect(service?.tiles).toEqual([{ width: 256, scaleFactors: [1, 2] }])
})

test('omits every absent optional number', () => {
  const service = normalizeImageService(
    imageServiceFixture({
      width: undefined,
      height: undefined,
      maxWidth: 'wide',
      maxHeight: 0,
      maxArea: -1,
    }),
    allowedOrigins,
  )
  expect(service).not.toHaveProperty('width')
  expect(service).not.toHaveProperty('height')
  expect(service).not.toHaveProperty('maxWidth')
  expect(service).not.toHaveProperty('maxHeight')
  expect(service).not.toHaveProperty('maxArea')
})

test('reads a service identified by @id', () => {
  expect(
    normalizeImageService(
      { '@id': `${iiifOrigin}/image/legacy`, type: 'ImageService2' },
      allowedOrigins,
    )?.id,
  ).toBe(`${iiifOrigin}/image/legacy`)
})

test('drops malformed tiles and sizes', () => {
  const service = normalizeImageService(
    imageServiceFixture({
      tiles: [{ width: 512 }, { width: 0, scaleFactors: [1] }, 'bad'],
      sizes: [{ width: 10 }, 'bad'],
    }),
    allowedOrigins,
  )
  expect(service?.tiles).toBeUndefined()
  expect(service?.sizes).toBeUndefined()
})

test('selects the first supported service from a body', () => {
  expect(
    selectImageServiceFromBody(
      [{ type: 'AuthProbe' }, imageServiceFixture()],
      allowedOrigins,
    )?.id,
  ).toBe(`${iiifOrigin}/image/K.1`)
  expect(selectImageServiceFromBody(undefined, allowedOrigins)).toBeUndefined()
  expect(
    selectImageServiceFromBody(imageServiceFixture(), allowedOrigins),
  ).toBeDefined()
})

test('builds an info.json url from the service id', () => {
  expect(
    imageInfoUrl({ id: `${iiifOrigin}/a`, serviceType: 'ImageService3' }),
  ).toBe(`${iiifOrigin}/a/info.json`)
  expect(
    imageInfoUrl({ id: `${iiifOrigin}/a/`, serviceType: 'ImageService3' }),
  ).toBe(`${iiifOrigin}/a/info.json`)
})

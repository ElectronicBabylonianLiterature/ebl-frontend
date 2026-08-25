import { normalizeManifest } from 'fragmentarium/infrastructure/iiif/iiifManifestAdapter'
import {
  allowedOrigins,
  iiifOrigin,
} from 'test-support/iiif-fixtures/iiifFixtures'
import {
  cyclicManifestFixture,
  externalOriginManifestFixture,
  hostileManifestFixture,
  imageInjection,
  scriptInjection,
} from 'test-support/iiif-fixtures/hostileIiifFixtures'

describe('hostile manifest', () => {
  const result = normalizeManifest(hostileManifestFixture(), allowedOrigins)
  const document = result.status === 'degraded' ? result.document : undefined

  test('is usable but degraded', () => {
    expect(result.status).toBe('degraded')
    expect(document?.media).toHaveLength(1)
  })

  test('keeps injected markup as inert plain text', () => {
    expect(document?.label).toBe(scriptInjection)
    expect(document?.summary).toBe(imageInjection)
    expect(document?.metadata).toEqual([
      { label: scriptInjection, value: imageInjection },
    ])
    expect(document?.requiredStatement?.value).toBe(scriptInjection)
    expect(document?.media[0].label).toBe(scriptInjection)
  })

  test('drops a javascript rights uri', () => {
    expect(document?.rights).toBeUndefined()
  })

  test('drops javascript and file homepages', () => {
    expect(document?.homepage).toBeUndefined()
    expect(document?.provider[0].homepage).toBeUndefined()
  })

  test('drops a data uri provider id', () => {
    expect(document?.provider[0]).toEqual({ label: scriptInjection })
  })

  test('drops a data uri thumbnail', () => {
    expect(document?.media[0].representations.thumbnail).toBeUndefined()
  })

  test('drops a javascript rendering', () => {
    expect(document?.media[0].renderings).toBeUndefined()
  })

  test('drops javascript and foreign image services', () => {
    expect(document?.media[0].representations.imageService).toBeUndefined()
    expect(
      document?.diagnostics.some(
        (diagnostic) => diagnostic.code === 'MISSING_IMAGE_SERVICE',
      ),
    ).toBe(true)
  })

  test('does not propagate unknown properties', () => {
    expect(document).not.toHaveProperty('partOf')
    expect(document).not.toHaveProperty('seeAlso')
    expect(document?.media[0]).not.toHaveProperty('seeAlso')
  })

  test('only exposes urls on allowed origins', () => {
    expect(document?.manifestId.startsWith(iiifOrigin)).toBe(true)
    expect(
      document?.media[0].representations.original.url.startsWith(iiifOrigin),
    ).toBe(true)
  })
})

test('rejects an externally hosted manifest', () => {
  expect(
    normalizeManifest(externalOriginManifestFixture(), allowedOrigins),
  ).toEqual({ status: 'invalid', reason: 'REJECTED_ORIGIN' })
})

test('does not recurse into a cyclic reference', () => {
  expect(
    normalizeManifest(cyclicManifestFixture(), allowedOrigins).status,
  ).toBe('ok')
})

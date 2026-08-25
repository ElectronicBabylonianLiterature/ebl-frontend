import Bluebird from 'bluebird'
import ApiClient, { ApiError } from 'http/ApiClient'
import {
  ApiIiifRepository,
  maximumManifestBytes,
} from 'fragmentarium/infrastructure/IiifRepository'
import { ImageServiceDescriptor } from 'fragmentarium/domain/mediaImageService'
import {
  allowedOrigins,
  foreignOrigin,
  iiifOrigin,
  imageServiceFixture,
  manifestFixture,
} from 'test-support/iiif-fixtures/iiifFixtures'

const manifestUrl = `${iiifOrigin}/presentation/K.1/manifest`
const service: ImageServiceDescriptor = {
  id: `${iiifOrigin}/image/K.1`,
  serviceType: 'ImageService3',
}

let apiClient: { fetch: jest.Mock }
let repository: ApiIiifRepository
const originalBaseUrl = process.env.REACT_APP_DICTIONARY_API_URL

function jsonResponse(body: unknown, contentLength?: string): Response {
  return {
    headers: { get: () => contentLength ?? null },
    json: () => Promise.resolve(body),
  } as unknown as Response
}

function malformedResponse(): Response {
  return {
    headers: { get: () => null },
    json: () => Promise.reject(new SyntaxError('Unexpected token')),
  } as unknown as Response
}

beforeEach(() => {
  process.env.REACT_APP_DICTIONARY_API_URL = iiifOrigin
  apiClient = { fetch: jest.fn() }
  repository = new ApiIiifRepository(
    apiClient as unknown as ApiClient,
    allowedOrigins,
  )
})

afterEach(() => {
  process.env.REACT_APP_DICTIONARY_API_URL = originalBaseUrl
})

describe('findManifest', () => {
  test('fetches and normalizes a manifest', async () => {
    apiClient.fetch.mockReturnValue(
      Bluebird.resolve(jsonResponse(manifestFixture())),
    )
    const result = await repository.findManifest(manifestUrl)
    expect(apiClient.fetch).toHaveBeenCalledWith(
      '/presentation/K.1/manifest',
      false,
      {},
    )
    expect(result.status).toBe('ok')
  })

  test('reports malformed json', async () => {
    apiClient.fetch.mockReturnValue(Bluebird.resolve(malformedResponse()))
    await expect(repository.findManifest(manifestUrl)).resolves.toEqual({
      status: 'invalid',
      reason: 'MALFORMED_JSON',
    })
  })

  test('rejects an oversized manifest before parsing', async () => {
    const json = jest.fn()
    apiClient.fetch.mockReturnValue(
      Bluebird.resolve({
        headers: { get: () => String(maximumManifestBytes + 1) },
        json,
      } as unknown as Response),
    )
    await expect(repository.findManifest(manifestUrl)).resolves.toEqual({
      status: 'invalid',
      reason: 'TOO_LARGE',
    })
    expect(json).not.toHaveBeenCalled()
  })

  test('accepts a manifest within the size limit', async () => {
    apiClient.fetch.mockReturnValue(
      Bluebird.resolve(jsonResponse(manifestFixture(), '1024')),
    )
    await expect(repository.findManifest(manifestUrl)).resolves.toMatchObject({
      status: 'ok',
    })
  })

  test.each([
    [401, { kind: 'http-401', canRetryAfterLogin: true }],
    [403, { kind: 'http-403', canRetryAfterLogin: false }],
  ])('maps %p to an authorization challenge', async (status, challenge) => {
    apiClient.fetch.mockReturnValue(
      Bluebird.reject(new ApiError('denied', {}, status)),
    )
    const result = await repository.findManifest(manifestUrl)
    expect(result.status).toBe('unauthorized')
    expect(result).toMatchObject({ challenge })
  })

  test.each([
    [404, { status: 'not-found' }],
    [500, { status: 'network-error', retryable: true }],
    [503, { status: 'network-error', retryable: true }],
    [400, { status: 'unavailable' }],
  ])('maps %p to %p', async (status, expected) => {
    apiClient.fetch.mockReturnValue(
      Bluebird.reject(new ApiError('failed', {}, status)),
    )
    await expect(repository.findManifest(manifestUrl)).resolves.toEqual(
      expected,
    )
  })

  test('maps a network failure to a retryable error', async () => {
    apiClient.fetch.mockReturnValue(Bluebird.reject(new TypeError('offline')))
    await expect(repository.findManifest(manifestUrl)).resolves.toEqual({
      status: 'network-error',
      retryable: true,
    })
  })

  test('maps an ApiError without a status to a retryable error', async () => {
    apiClient.fetch.mockReturnValue(Bluebird.reject(new ApiError('bad', {})))
    await expect(repository.findManifest(manifestUrl)).resolves.toEqual({
      status: 'network-error',
      retryable: true,
    })
  })

  test.each([
    ['a foreign origin', `${foreignOrigin}/manifest`],
    ['a non-https url', 'http://iiif.example.com/manifest'],
  ])('never requests %s', async (unused, url) => {
    await expect(repository.findManifest(url)).resolves.toEqual({
      status: 'unavailable',
    })
    expect(apiClient.fetch).not.toHaveBeenCalled()
  })

  test('cancels the request when the signal aborts', async () => {
    const request = new Bluebird<Response>(() => undefined)
    apiClient.fetch.mockReturnValue(request)
    const controller = new AbortController()
    const pending = repository.findManifest(manifestUrl, controller.signal)
    controller.abort()
    expect(pending.isCancelled()).toBe(true)
  })
})

describe('findImageInfo', () => {
  test('fetches and normalizes info.json', async () => {
    apiClient.fetch.mockReturnValue(
      Bluebird.resolve(jsonResponse(imageServiceFixture())),
    )
    const result = await repository.findImageInfo(service)
    expect(apiClient.fetch).toHaveBeenCalledWith(
      '/image/K.1/info.json',
      false,
      {},
    )
    expect(result).toMatchObject({
      status: 'ok',
      service: { complianceLevel: 'level2', width: 4000 },
    })
  })

  test('is unavailable when info.json is not a supported service', async () => {
    apiClient.fetch.mockReturnValue(Bluebird.resolve(jsonResponse({})))
    await expect(repository.findImageInfo(service)).resolves.toEqual({
      status: 'unavailable',
    })
  })

  test('is unavailable when the request fails', async () => {
    apiClient.fetch.mockReturnValue(
      Bluebird.reject(new ApiError('missing', {}, 404)),
    )
    await expect(repository.findImageInfo(service)).resolves.toEqual({
      status: 'unavailable',
    })
  })

  test('never requests a foreign image service', async () => {
    await expect(
      repository.findImageInfo({ ...service, id: `${foreignOrigin}/image` }),
    ).resolves.toEqual({ status: 'unavailable' })
    expect(apiClient.fetch).not.toHaveBeenCalled()
  })

  test('cancels the request when the signal aborts', async () => {
    const request = new Bluebird<Response>(() => undefined)
    apiClient.fetch.mockReturnValue(request)
    const controller = new AbortController()
    const pending = repository.findImageInfo(service, controller.signal)
    controller.abort()
    expect(pending.isCancelled()).toBe(true)
  })
})

test('defaults the allowed origins to the configured api origin', async () => {
  const defaulted = new ApiIiifRepository(apiClient as unknown as ApiClient)
  apiClient.fetch.mockReturnValue(
    Bluebird.resolve(jsonResponse(manifestFixture())),
  )
  await expect(defaulted.findManifest(manifestUrl)).resolves.toMatchObject({
    status: 'ok',
  })
})

import Bluebird from 'bluebird'
import ApiClient, { ApiError } from 'http/ApiClient'
import { ImageServiceDescriptor } from 'fragmentarium/domain/mediaImageService'
import {
  ImageInfoFetchResult,
  ManifestFetchResult,
} from 'fragmentarium/domain/iiifResult'
import { normalizeManifest } from 'fragmentarium/infrastructure/iiif/iiifManifestAdapter'
import {
  imageInfoUrl,
  normalizeImageService,
} from 'fragmentarium/infrastructure/iiif/iiifImageService'
import { toApiPath } from 'fragmentarium/infrastructure/iiif/iiifApiPath'
import { configuredIiifOrigins } from 'fragmentarium/infrastructure/iiif/iiifValidation'

export const maximumManifestBytes = 5 * 1024 * 1024

const forbiddenMessage = "You don't have permissions to view this manifest."
const unauthorizedMessage = 'Sign in to view this manifest.'

function unauthorized(status: number): ManifestFetchResult {
  return status === 401
    ? {
        status: 'unauthorized',
        challenge: {
          kind: 'http-401',
          message: unauthorizedMessage,
          canRetryAfterLogin: true,
        },
      }
    : {
        status: 'unauthorized',
        challenge: {
          kind: 'http-403',
          message: forbiddenMessage,
          canRetryAfterLogin: false,
        },
      }
}

export function toManifestFetchResult(error: unknown): ManifestFetchResult {
  if (!(error instanceof ApiError) || error.status === undefined) {
    return { status: 'network-error', retryable: true }
  }
  if (error.status === 401 || error.status === 403) {
    return unauthorized(error.status)
  }
  if (error.status === 404) {
    return { status: 'not-found' }
  }
  return error.status >= 500
    ? { status: 'network-error', retryable: true }
    : { status: 'unavailable' }
}

function exceedsSizeLimit(response: Response): boolean {
  const contentLength = Number(response.headers.get('content-length'))
  return Number.isFinite(contentLength) && contentLength > maximumManifestBytes
}

function readJson(response: Response): Bluebird<unknown> {
  return Bluebird.resolve(response.json()).catch(() => undefined)
}

export interface IiifRepository {
  findManifest(
    manifestUrl: string,
    signal?: AbortSignal,
  ): Bluebird<ManifestFetchResult>
  findImageInfo(
    service: ImageServiceDescriptor,
    signal?: AbortSignal,
  ): Bluebird<ImageInfoFetchResult>
}

export class ApiIiifRepository implements IiifRepository {
  private readonly apiClient: ApiClient
  private readonly allowedOrigins: readonly string[]

  constructor(
    apiClient: ApiClient,
    allowedOrigins: readonly string[] = configuredIiifOrigins(),
  ) {
    this.apiClient = apiClient
    this.allowedOrigins = allowedOrigins
  }

  findManifest(
    manifestUrl: string,
    signal?: AbortSignal,
  ): Bluebird<ManifestFetchResult> {
    const path = toApiPath(manifestUrl, this.allowedOrigins)
    if (path === undefined) {
      return Bluebird.resolve<ManifestFetchResult>({ status: 'unavailable' })
    }
    return this.abortable(
      this.apiClient
        .fetch(path, false, {})
        .then((response) =>
          exceedsSizeLimit(response)
            ? Bluebird.resolve<ManifestFetchResult>({
                status: 'invalid',
                reason: 'TOO_LARGE',
              })
            : readJson(response).then((json) => this.normalize(json)),
        )
        .catch(toManifestFetchResult),
      signal,
    )
  }

  findImageInfo(
    service: ImageServiceDescriptor,
    signal?: AbortSignal,
  ): Bluebird<ImageInfoFetchResult> {
    const path = toApiPath(imageInfoUrl(service), this.allowedOrigins)
    if (path === undefined) {
      return Bluebird.resolve<ImageInfoFetchResult>({ status: 'unavailable' })
    }
    return this.abortable(
      this.apiClient
        .fetch(path, false, {})
        .then((response) => readJson(response))
        .then((json) => {
          const normalized = normalizeImageService(json, this.allowedOrigins)
          return normalized === undefined
            ? ({ status: 'unavailable' } as ImageInfoFetchResult)
            : ({ status: 'ok', service: normalized } as ImageInfoFetchResult)
        })
        .catch(() => ({ status: 'unavailable' }) as ImageInfoFetchResult),
      signal,
    )
  }

  private normalize(json: unknown): ManifestFetchResult {
    return json === undefined
      ? { status: 'invalid', reason: 'MALFORMED_JSON' }
      : normalizeManifest(json, this.allowedOrigins)
  }

  private abortable<Value>(
    request: Bluebird<Value>,
    signal?: AbortSignal,
  ): Bluebird<Value> {
    if (signal !== undefined) {
      signal.addEventListener('abort', () => request.cancel(), { once: true })
    }
    return request
  }
}

import type MediaManagementRepository from 'fragmentarium/application/MediaManagementRepository'
import type {
  MediaUploadMetadata,
  MediaUploadOptions,
} from 'fragmentarium/application/MediaManagementRepository'
import { UnsupportedMediaResponseError } from 'fragmentarium/application/MediaRepository'
import {
  encodeMediaMetadataHeader,
  MEDIA_METADATA_HEADER_LIMIT,
  MEDIA_METADATA_TOO_LONG_MESSAGE,
} from 'fragmentarium/application/mediaMetadataHeader'
import type { MediaResource } from 'fragmentarium/domain/media'
import { normalizeMediaResource } from 'fragmentarium/infrastructure/mediaResourceMapper'
import { isRecord } from 'fragmentarium/infrastructure/mediaMapperValidation'
import { fragmentMediaListUrl } from 'fragmentarium/infrastructure/mediaUrls'
import type ApiClient from 'http/ApiClient'
import { isDefinitiveRejection, isStaleRevision } from 'http/ApiError'
import { ApiError } from 'http/ApiError'

function mediaUrl(fragment: string, id: string, action = ''): string {
  return `/media/${encodeURIComponent(id)}${action ? `/${action}` : ''}?fragment=${encodeURIComponent(fragment)}`
}

/** `If-Match` for a known revision; no header when the revision is unknown. */
function ifMatch(revision: number | undefined): Record<string, string> {
  return revision === undefined ? {} : { 'If-Match': `"${revision}"` }
}

function canonical(response: unknown, id?: string): MediaResource {
  if (!isRecord(response) || !Array.isArray(response.media))
    throw new UnsupportedMediaResponseError(
      'The media response could not be read.',
    )
  const resources = response.media.map(normalizeMediaResource)
  if (resources.some((resource) => !resource))
    throw new UnsupportedMediaResponseError(
      'The media response contains unsupported images.',
    )
  const media = id
    ? resources.find((resource) => resource?.id === id)
    : resources.length === 1
      ? resources[0]
      : undefined
  if (!media)
    throw new UnsupportedMediaResponseError(
      'The saved media was missing from the response.',
    )
  return media
}

export default class ApiMediaManagementRepository implements MediaManagementRepository {
  private readonly requests = new Set<AbortController>()
  private disposed = false
  private lifecycleGeneration = 0

  constructor(
    private readonly api: Pick<ApiClient, 'uploadBinary' | 'requestJson'>,
    private readonly onChanged: (fragment: string) => void = () => undefined,
  ) {}

  activate(): void {
    this.disposed = false
  }

  dispose(): void {
    this.disposed = true
    this.lifecycleGeneration += 1
    this.requests.forEach((request) => request.abort())
    this.requests.clear()
  }

  private isCurrent(generation: number): boolean {
    return !this.disposed && generation === this.lifecycleGeneration
  }

  private async run<T>(
    fragment: string,
    signal: AbortSignal | undefined,
    request: (signal: AbortSignal, onDispatched: () => void) => Promise<T>,
  ): Promise<T> {
    const generation = this.lifecycleGeneration
    const controller = new AbortController()
    const abort = (): void => controller.abort()
    if (this.disposed || signal?.aborted)
      throw new DOMException('Media request cancelled', 'AbortError')
    signal?.addEventListener('abort', abort, { once: true })
    this.requests.add(controller)
    let reported = false
    let dispatched = false
    try {
      const result = await request(controller.signal, () => {
        dispatched = true
      })
      if (!this.isCurrent(generation) || controller.signal.aborted) {
        throw new DOMException('Media request cancelled', 'AbortError')
      }
      reported = true
      this.onChanged(fragment)
      return result
    } catch (error) {
      // A sent request may have committed unless the server definitively
      // rejected it (HTTP 4xx): cancellation, network loss, gateway errors and
      // unreadable success bodies all leave the outcome uncertain. Disposal
      // permanently fences this request even if the adapter is activated again.
      // A stale revision (412/428) is definitive for this request, but proves
      // someone else changed the item, so cached views are out of date too.
      if (
        !reported &&
        dispatched &&
        this.isCurrent(generation) &&
        (!isDefinitiveRejection(error) || isStaleRevision(error))
      )
        this.onChanged(fragment)
      throw error
    } finally {
      signal?.removeEventListener('abort', abort)
      this.requests.delete(controller)
    }
  }

  upload(
    fragment: string,
    file: File,
    metadata: MediaUploadMetadata,
    idempotencyKey: string,
    options: MediaUploadOptions = {},
  ): Promise<MediaResource> {
    const metadataHeader = encodeMediaMetadataHeader(metadata, file.name)
    // The API would answer 413; never send a request that cannot succeed.
    if (metadataHeader.length > MEDIA_METADATA_HEADER_LIMIT)
      return Promise.reject(
        new ApiError(MEDIA_METADATA_TOO_LONG_MESSAGE, {}, 413),
      )
    return this.run(fragment, options.signal, async (signal, onDispatched) =>
      canonical(
        await this.api.uploadBinary(
          fragmentMediaListUrl(fragment),
          file,
          {
            'Content-Type': file.type,
            'Idempotency-Key': idempotencyKey,
            'X-Media-Metadata': metadataHeader,
          },
          { ...options, signal, onDispatched },
        ),
      ),
    )
  }

  update(
    fragment: string,
    id: string,
    metadata: Partial<MediaUploadMetadata>,
    signal?: AbortSignal,
    revision?: number,
  ): Promise<MediaResource> {
    return this.run(fragment, signal, async (requestSignal, onDispatched) =>
      canonical(
        await this.api.requestJson(
          mediaUrl(fragment, id),
          'PATCH',
          metadata,
          requestSignal,
          onDispatched,
          ifMatch(revision),
        ),
        id,
      ),
    )
  }

  setPrimary(
    fragment: string,
    id: string,
    signal?: AbortSignal,
    revision?: number,
  ): Promise<MediaResource> {
    return this.action(fragment, id, 'primary', undefined, signal, revision)
  }

  publish(
    fragment: string,
    id: string,
    reason?: string,
    signal?: AbortSignal,
    revision?: number,
  ): Promise<MediaResource> {
    return this.action(fragment, id, 'publish', reason, signal, revision)
  }

  reject(
    fragment: string,
    id: string,
    reason?: string,
    signal?: AbortSignal,
    revision?: number,
  ): Promise<MediaResource> {
    return this.action(fragment, id, 'reject', reason, signal, revision)
  }

  private action(
    fragment: string,
    id: string,
    action: string,
    reason?: string,
    signal?: AbortSignal,
    revision?: number,
  ): Promise<MediaResource> {
    return this.run(fragment, signal, async (requestSignal, onDispatched) =>
      canonical(
        await this.api.requestJson(
          mediaUrl(fragment, id, action),
          'POST',
          reason ? { reason } : {},
          requestSignal,
          onDispatched,
          ifMatch(revision),
        ),
        id,
      ),
    )
  }

  remove(
    fragment: string,
    id: string,
    signal?: AbortSignal,
    revision?: number,
  ): Promise<void> {
    return this.run(fragment, signal, async (requestSignal, onDispatched) => {
      await this.api.requestJson(
        mediaUrl(fragment, id),
        'DELETE',
        undefined,
        requestSignal,
        onDispatched,
        ifMatch(revision),
      )
    })
  }
}

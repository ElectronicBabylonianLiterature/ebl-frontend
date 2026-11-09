import type MediaManagementRepository from 'fragmentarium/application/MediaManagementRepository'
import type {
  MediaUploadMetadata,
  MediaUploadOptions,
} from 'fragmentarium/application/MediaManagementRepository'
import { UnsupportedMediaResponseError } from 'fragmentarium/application/MediaRepository'
import type { MediaResource } from 'fragmentarium/domain/media'
import { normalizeMediaResource } from 'fragmentarium/infrastructure/mediaResourceMapper'
import { isRecord } from 'fragmentarium/infrastructure/mediaMapperValidation'
import { fragmentMediaListUrl } from 'fragmentarium/infrastructure/mediaUrls'
import type ApiClient from 'http/ApiClient'

function mediaUrl(fragment: string, id: string, action = ''): string {
  return `/media/${encodeURIComponent(id)}${action ? `/${action}` : ''}?fragment=${encodeURIComponent(fragment)}`
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
      // Only a sent request can have committed despite cancellation. Disposal
      // permanently fences this request even if the adapter is activated again.
      if (
        !reported &&
        dispatched &&
        this.isCurrent(generation) &&
        controller.signal.aborted
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
    return this.run(fragment, options.signal, async (signal, onDispatched) =>
      canonical(
        await this.api.uploadBinary(
          fragmentMediaListUrl(fragment),
          file,
          {
            'Content-Type': file.type,
            'Idempotency-Key': idempotencyKey,
            'X-Media-Metadata': encodeURIComponent(
              JSON.stringify({ ...metadata, originalFilename: file.name }),
            ),
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
  ): Promise<MediaResource> {
    return this.run(fragment, signal, async (requestSignal, onDispatched) =>
      canonical(
        await this.api.requestJson(
          mediaUrl(fragment, id),
          'PATCH',
          metadata,
          requestSignal,
          onDispatched,
        ),
        id,
      ),
    )
  }

  setPrimary(
    fragment: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<MediaResource> {
    return this.action(fragment, id, 'primary', undefined, signal)
  }

  publish(
    fragment: string,
    id: string,
    reason?: string,
    signal?: AbortSignal,
  ): Promise<MediaResource> {
    return this.action(fragment, id, 'publish', reason, signal)
  }

  reject(
    fragment: string,
    id: string,
    reason?: string,
    signal?: AbortSignal,
  ): Promise<MediaResource> {
    return this.action(fragment, id, 'reject', reason, signal)
  }

  private action(
    fragment: string,
    id: string,
    action: string,
    reason?: string,
    signal?: AbortSignal,
  ): Promise<MediaResource> {
    return this.run(fragment, signal, async (requestSignal, onDispatched) =>
      canonical(
        await this.api.requestJson(
          mediaUrl(fragment, id, action),
          'POST',
          reason ? { reason } : {},
          requestSignal,
          onDispatched,
        ),
        id,
      ),
    )
  }

  remove(fragment: string, id: string, signal?: AbortSignal): Promise<void> {
    return this.run(fragment, signal, async (requestSignal, onDispatched) => {
      await this.api.requestJson(
        mediaUrl(fragment, id),
        'DELETE',
        undefined,
        requestSignal,
        onDispatched,
      )
    })
  }
}

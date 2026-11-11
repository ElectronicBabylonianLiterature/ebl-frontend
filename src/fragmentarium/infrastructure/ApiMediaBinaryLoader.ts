import type MediaBinaryLoader from 'fragmentarium/application/MediaBinaryLoader'
import type { MediaBinaryRequest } from 'fragmentarium/application/MediaBinaryLoader'
import {
  isOriginalMediaMimeType,
  isRasterMediaMimeType,
} from 'fragmentarium/domain/media'
import { fragmentMediaBinaryUrl } from 'fragmentarium/infrastructure/mediaUrls'
import type { JsonApiClient } from 'http/JsonApiClient'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'

export default class ApiMediaBinaryLoader implements MediaBinaryLoader {
  private readonly limiter = new ConcurrencyLimiter(4)

  constructor(private readonly apiClient: Pick<JsonApiClient, 'fetchBlob'>) {}

  fetch(request: MediaBinaryRequest, signal?: AbortSignal): Promise<Blob> {
    return this.limiter.run(async () => {
      const blob = await this.apiClient.fetchBlob(
        fragmentMediaBinaryUrl(request),
        false,
        signal,
      )
      const supported =
        request.representation === 'original'
          ? isOriginalMediaMimeType(blob.type)
          : isRasterMediaMimeType(blob.type)
      if (!supported || blob.size === 0) {
        throw new Error(
          'The image response is empty or has an unsupported format.',
        )
      }
      return blob
    }, signal)
  }
}

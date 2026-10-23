import MediaRepository, {
  UnsupportedMediaResponseError,
} from 'fragmentarium/application/MediaRepository'
import type { MediaResource } from 'fragmentarium/domain/media'
import { normalizeFragmentMediaResponse } from 'fragmentarium/infrastructure/mediaMapper'
import { isRecord } from 'fragmentarium/infrastructure/mediaMapperValidation'
import { fragmentMediaListUrl } from 'fragmentarium/infrastructure/mediaUrls'
import { ApiError } from 'http/ApiClient'
import type { JsonApiClient } from 'http/JsonApiClient'

export default class ApiMediaRepository implements MediaRepository {
  constructor(private readonly apiClient: Pick<JsonApiClient, 'fetchJson'>) {}

  async findByFragment(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<readonly MediaResource[]> {
    try {
      const response = await this.apiClient.fetchJson(
        fragmentMediaListUrl(fragmentNumber),
        false,
        signal,
      )
      if (!isRecord(response) || !Array.isArray(response.media)) {
        throw new UnsupportedMediaResponseError(
          'The media response could not be read.',
        )
      }
      const { media } = normalizeFragmentMediaResponse(response)
      if (
        media.length !== response.media.length ||
        new Set(media.map(({ id }) => id)).size !== media.length
      ) {
        throw new UnsupportedMediaResponseError(
          'The media response contains unsupported images.',
        )
      }
      return media
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return []
      }
      throw error
    }
  }
}

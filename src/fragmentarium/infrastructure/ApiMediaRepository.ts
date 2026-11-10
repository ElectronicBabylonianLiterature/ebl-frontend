import MediaRepository, {
  UnsupportedMediaResponseError,
} from 'fragmentarium/application/MediaRepository'
import type { MediaGalleryResponse } from 'fragmentarium/application/MediaRepository'
import type { MediaResource } from 'fragmentarium/domain/media'
import { normalizeFragmentMediaResponse } from 'fragmentarium/infrastructure/mediaMapper'
import { isRecord } from 'fragmentarium/infrastructure/mediaMapperValidation'
import { fragmentMediaListUrl } from 'fragmentarium/infrastructure/mediaUrls'
import { isNotFoundError } from 'http/ApiClient'
import type { JsonApiClient } from 'http/JsonApiClient'

export default class ApiMediaRepository implements MediaRepository {
  constructor(
    private readonly apiClient: Pick<JsonApiClient, 'fetchJson'>,
    private readonly managementView = false,
  ) {}

  async findByFragment(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<readonly MediaResource[]> {
    return (await this.findGallery(fragmentNumber, signal)).media
  }

  async findGallery(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<MediaGalleryResponse> {
    try {
      const response = await this.apiClient.fetchJson(
        `${fragmentMediaListUrl(fragmentNumber)}${this.managementView ? '&view=management' : ''}`,
        this.managementView,
        signal,
      )
      if (!isRecord(response)) {
        throw new UnsupportedMediaResponseError(
          'The media response could not be read.',
        )
      }
      const fallbackOnError =
        response.legacyFallbackAllowed === false ||
        (response.legacyFallbackAllowed !== undefined &&
          typeof response.legacyFallbackAllowed !== 'boolean')
          ? false
          : undefined
      if (!Array.isArray(response.media)) {
        throw new UnsupportedMediaResponseError(
          'The media response could not be read.',
          fallbackOnError,
        )
      }
      if (
        response.legacyFallbackAllowed !== undefined &&
        typeof response.legacyFallbackAllowed !== 'boolean'
      ) {
        throw new UnsupportedMediaResponseError(
          'The legacy media visibility response could not be read.',
          false,
        )
      }
      const { media } = normalizeFragmentMediaResponse(response)
      if (
        media.length !== response.media.length ||
        new Set(media.map(({ id }) => id)).size !== media.length
      ) {
        throw new UnsupportedMediaResponseError(
          'The media response contains unsupported images.',
          fallbackOnError,
        )
      }
      return {
        media,
        ...(response.legacyFallbackAllowed !== undefined
          ? { legacyFallbackAllowed: response.legacyFallbackAllowed }
          : {}),
      }
    } catch (error) {
      if (isNotFoundError(error)) {
        if (this.managementView) {
          return new ApiMediaRepository(this.apiClient).findGallery(
            fragmentNumber,
            signal,
          )
        }
        return { media: [] }
      }
      throw error
    }
  }
}

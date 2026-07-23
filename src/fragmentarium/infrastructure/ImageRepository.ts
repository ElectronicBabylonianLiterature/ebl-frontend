import Folio from 'fragmentarium/domain/Folio'
import {
  ImageRepository,
  ThumbnailSize,
  ThumbnailBlob,
} from 'fragmentarium/application/FragmentService'

class ApiImageRepository implements ImageRepository {
  private readonly apiClient

  constructor(apiClient: {
    fetchBlob: (
      url: string,
      authorize: boolean,
      signal?: AbortSignal,
    ) => Promise<Blob>
  }) {
    this.apiClient = apiClient
  }

  find(fileName: string): Promise<Blob> {
    return this.apiClient.fetchBlob(
      `/images/${encodeURIComponent(fileName)}`,
      false,
    )
  }

  findFolio(folio: Folio, signal?: AbortSignal): Promise<Blob> {
    const name = encodeURIComponent(folio.name)
    const number = encodeURIComponent(folio.number)
    return this.apiClient.fetchBlob(`/folios/${name}/${number}`, false, signal)
  }

  findPhoto(number: string, signal?: AbortSignal): Promise<Blob> {
    return this.apiClient.fetchBlob(
      `/fragments/${encodeURIComponent(number)}/photo`,
      false,
      signal,
    )
  }

  findThumbnail(number: string, size: ThumbnailSize): Promise<ThumbnailBlob> {
    return this.apiClient
      .fetchBlob(
        `/fragments/${encodeURIComponent(number)}/thumbnail/${size}`,
        false,
      )
      .then((data) => ({ blob: data }))
      .catch((error) => {
        if (error.data.title === '404 Not Found') {
          return { blob: null }
        } else {
          throw error
        }
      })
  }
}

export default ApiImageRepository

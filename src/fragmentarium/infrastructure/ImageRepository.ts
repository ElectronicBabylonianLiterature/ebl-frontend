import Promise from 'bluebird'
import Folio from 'fragmentarium/domain/Folio'
import {
  ImageRepository,
  ThumbnailSize,
  ThumbnailBlob,
} from 'fragmentarium/application/FragmentService'
import { ApiError } from 'http/ApiClient'

function hasNotFoundTitle(data: unknown): data is { title: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    data.title === '404 Not Found'
  )
}

function isThumbnailNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 404 || hasNotFoundTitle(error.data))
  )
}

class ApiImageRepository implements ImageRepository {
  private readonly apiClient

  constructor(apiClient: {
    fetchBlob: (
      url: string,
      authorize: boolean,
      ignoredErrorStatuses?: readonly number[],
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

  findFolio(folio: Folio): Promise<Blob> {
    const name = encodeURIComponent(folio.name)
    const number = encodeURIComponent(folio.number)
    return this.apiClient.fetchBlob(`/folios/${name}/${number}`, false)
  }

  findPhoto(number: string): Promise<Blob> {
    return this.apiClient.fetchBlob(
      `/fragments/${encodeURIComponent(number)}/photo`,
      false,
    )
  }

  findThumbnail(number: string, size: ThumbnailSize): Promise<ThumbnailBlob> {
    return this.apiClient
      .fetchBlob(
        `/fragments/${encodeURIComponent(number)}/thumbnail/${size}`,
        false,
        [404],
      )
      .then((data) => ({ blob: data }))
      .catch((error: unknown) => {
        if (isThumbnailNotFound(error)) {
          return { blob: null }
        } else {
          throw error
        }
      })
  }
}

export default ApiImageRepository

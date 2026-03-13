import Promise from 'bluebird'
import Folio from 'fragmentarium/domain/Folio'
import {
  ImageRepository,
  ThumbnailSize,
  ThumbnailBlob,
} from 'fragmentarium/application/FragmentService'
import {
  folioPath,
  fragmentPhotoPath,
  fragmentThumbnailPath,
  staticImagePath,
} from 'common/iiif'

class ApiImageRepository implements ImageRepository {
  private readonly apiClient

  constructor(apiClient: {
    fetchBlob: (url: string, authorize: boolean) => Promise<Blob>
  }) {
    this.apiClient = apiClient
  }

  find(fileName: string): Promise<Blob> {
    return this.apiClient.fetchBlob(staticImagePath(fileName), false)
  }

  findFolio(folio: Folio): Promise<Blob> {
    return this.apiClient.fetchBlob(folioPath(folio.name, folio.number), false)
  }

  findPhoto(number: string): Promise<Blob> {
    return this.apiClient.fetchBlob(fragmentPhotoPath(number), false)
  }

  findThumbnail(number: string, size: ThumbnailSize): Promise<ThumbnailBlob> {
    return this.apiClient
      .fetchBlob(fragmentThumbnailPath(number, size), false)
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

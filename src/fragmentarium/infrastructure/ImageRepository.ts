import Promise from 'bluebird'
import { Folio } from 'fragmentarium/domain/fragment'
import { ImageRepository } from 'fragmentarium/application/FragmentService'

class ApiImageRepository implements ImageRepository {
  private readonly apiClient

  constructor(apiClient: {
    fetchBlob: (url: string, authorize: boolean) => Promise<Blob>
  }) {
    this.apiClient = apiClient
  }

  find(fileName: string): Promise<Blob> {
    return this.apiClient.fetchBlob(
      `/images/${encodeURIComponent(fileName)}`,
      false
    )
  }

  findFolio(folio: Folio): Promise<Blob> {
    const name = encodeURIComponent(folio.name)
    const number = encodeURIComponent(folio.number)
    return this.apiClient.fetchBlob(`/folios/${name}/${number}`, true)
  }

  findPhoto(number: string): Promise<Blob> {
    return this.apiClient.fetchBlob(
      `/fragments/${encodeURIComponent(number)}/photo`,
      true
    )
  }
}

export default ApiImageRepository

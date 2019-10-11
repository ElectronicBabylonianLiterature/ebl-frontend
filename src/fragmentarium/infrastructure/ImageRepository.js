// @flow
import { Folio } from 'fragmentarium/domain/fragment'
import type { ImageRepository } from 'fragmentarium/application/FragmentService'

class ApiImageRepository implements ImageRepository {
  #apiClient

  constructor(apiClient: { fetchBlob: (string, boolean) => Blob }) {
    this.#apiClient = apiClient
  }

  find(fileName: string): Blob {
    return this.#apiClient.fetchBlob(
      `/images/${encodeURIComponent(fileName)}`,
      false
    )
  }

  findFolio(folio: Folio): Blob {
    const name = encodeURIComponent(folio.name)
    const number = encodeURIComponent(folio.number)
    return this.#apiClient.fetchBlob(`/folios/${name}/${number}`, true)
  }

  findPhoto(number: string): Blob {
    return this.#apiClient.fetchBlob(
      `/fragments/${encodeURIComponent(number)}/photo`,
      true
    )
  }
}

export default ApiImageRepository

class ImageRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  find (fileName) {
    return this.apiClient.fetchBlob(`/images/${fileName}`, true)
  }
}

export default ImageRepository

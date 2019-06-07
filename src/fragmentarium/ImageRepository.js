class ImageRepository {
  constructor(apiClient) {
    this.apiClient = apiClient
  }

  find(fileName, authenticate) {
    return this.apiClient.fetchBlob(`/images/${fileName}`, authenticate)
  }
}

export default ImageRepository

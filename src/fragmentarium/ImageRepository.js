class WordRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  find (fileName) {
    return this.apiClient.fetchBlob(`/images/${fileName}`, true)
  }
}

export default WordRepository

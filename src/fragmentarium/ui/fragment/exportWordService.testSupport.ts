import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import WordService from 'dictionary/application/WordService'

export function createWordService(): WordService {
  const wordService = new WordService(
    new WordRepository(
      new ApiClient(
        { getAccessToken: jest.fn(), isAuthenticated: jest.fn() },
        { captureException: jest.fn() },
      ),
    ),
  )
  jest.spyOn(wordService, 'findAll').mockResolvedValue([])
  return wordService
}

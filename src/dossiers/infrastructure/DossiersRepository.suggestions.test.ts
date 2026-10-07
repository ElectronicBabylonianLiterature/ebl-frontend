import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import {
  createDossiersRepositoryTestContext,
  DossiersRepositoryTestContext,
  resultStub,
} from 'dossiers/infrastructure/DossiersRepository.testSupport'

jest.mock('http/ApiClient')
jest.mock('dossiers/application/DossiersService')

const suggestionStub = {
  id: 'D001',
  description: 'Test dossier suggestion',
}
const suggestion = new DossierRecordSuggestion(suggestionStub)

let context: DossiersRepositoryTestContext

beforeEach(() => {
  jest.clearAllMocks()
  context = createDossiersRepositoryTestContext()
})

describe('DossiersRepository - searchSuggestions', () => {
  it('fetches suggestions successfully', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([suggestionStub])
    const response = await dossiersRepository.searchSuggestions('test')
    expect(response).toEqual([suggestion])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test',
      false,
    )
  })

  it('handles empty query string', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.searchSuggestions('')
    expect(response).toEqual([])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=',
      false,
    )
  })

  it('handles empty response', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.searchSuggestions('nonexistent')
    expect(response).toEqual([])
  })

  it('handles multiple suggestions', async () => {
    const { apiClient, dossiersRepository } = context
    const suggestionStub2 = {
      id: 'D002',
      description: 'Another dossier',
    }
    const suggestion2 = new DossierRecordSuggestion(suggestionStub2)
    apiClient.fetchJson.mockResolvedValueOnce([suggestionStub, suggestionStub2])
    const response = await dossiersRepository.searchSuggestions('test')
    expect(response).toEqual([suggestion, suggestion2])
  })

  it('handles API errors', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockRejectedValueOnce(new Error('Search Error'))
    await expect(dossiersRepository.searchSuggestions('test')).rejects.toThrow(
      'Search Error',
    )
  })

  it('constructs URL correctly with special characters', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([])
    await dossiersRepository.searchSuggestions('test query')
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test%20query',
      false,
    )
  })

  it('filters suggestions by fetching filtered dossiers when filters provided', async () => {
    const { apiClient, dossiersRepository } = context
    const suggestion2Stub = {
      id: 'D002',
      description: 'Another dossier',
    }

    const filteredDossierStub = {
      ...resultStub,
      _id: 'D001',
    }

    apiClient.fetchJson
      .mockResolvedValueOnce([suggestionStub, suggestion2Stub])
      .mockResolvedValueOnce([filteredDossierStub])

    const response = await dossiersRepository.searchSuggestions('test', {
      genre: 'Incantation',
      provenance: 'Babylon',
    })

    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test',
      false,
    )
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/filter?genre=Incantation&provenance=Babylon',
      false,
    )
    expect(response).toEqual([suggestion])
  })

  it('filters out empty filter values', async () => {
    const { apiClient, dossiersRepository } = context
    const filteredDossierStub = {
      ...resultStub,
      _id: 'D001',
    }

    apiClient.fetchJson
      .mockResolvedValueOnce([suggestionStub])
      .mockResolvedValueOnce([filteredDossierStub])

    const response = await dossiersRepository.searchSuggestions('test', {
      genre: 'Incantation',
      provenance: null,
      scriptPeriod: '',
    })

    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test',
      false,
    )
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/filter?genre=Incantation',
      false,
    )
    expect(response).toEqual([suggestion])
  })

  it('handles undefined filters', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([suggestionStub])
    const response = await dossiersRepository.searchSuggestions(
      'test',
      undefined,
    )
    expect(response).toEqual([suggestion])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test',
      false,
    )
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
  })

  it('does not fetch filtered dossiers when all filter values are empty', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([suggestionStub])
    const response = await dossiersRepository.searchSuggestions('test', {
      genre: null,
      provenance: null,
      scriptPeriod: '',
    })
    expect(response).toEqual([suggestion])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test',
      false,
    )
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
  })
})

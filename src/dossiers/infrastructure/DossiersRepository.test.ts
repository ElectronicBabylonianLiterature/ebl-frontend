import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import ApiClient from 'http/ApiClient'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'

jest.mock('http/ApiClient')
jest.mock('dossiers/application/DossiersService')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const dossiersRepository = new DossiersRepository(apiClient)

const resultStub = {
  _id: 'test',
  description: 'some description',
  isApproximateDate: true,
  yearRangeFrom: -500,
  yearRangeTo: -470,
  relatedKings: [10.2, 11],
  provenance: 'Assyria',
  script: {
    period: 'Neo-Assyrian',
    periodModifier: 'None',
    uncertain: false,
  },
  references: [referenceDtoFactory.build()],
}

const query = ['test', 'test2']
const record = new DossierRecord(resultStub)

describe('DossiersRepository - fetchAllDossiers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches all dossiers without errors', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchAllDossiers()
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/dossiers', false)
  })

  it('handles response with dossiers wrapper', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      dossiers: [resultStub],
      totalCount: 1,
    })
    const response = await dossiersRepository.fetchAllDossiers()
    expect(response).toEqual([record])
  })

  it('handles empty response', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.fetchAllDossiers()
    expect(response).toEqual([])
  })

  it('handles API errors gracefully', async () => {
    apiClient.fetchJson.mockRejectedValueOnce(new Error('API Error'))
    const response = await dossiersRepository.fetchAllDossiers()
    expect(response).toEqual([])
  })
})

describe('DossiersRepository - search by ids', () => {
  it('handles search without errors', () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = dossiersRepository.queryByIds(query)
    response.then((resolvedResponse) => {
      expect(resolvedResponse).toEqual([record])
    })

    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers?ids[]=test&ids[]=test2',
      false,
    )
  })

  it('handles different query strings', async () => {
    const query2 = ['test2']
    const resultStub2 = {
      ...resultStub,
      id: 'test2',
      description: 'another description',
    }
    const record2 = new DossierRecord(resultStub2)
    apiClient.fetchJson.mockResolvedValueOnce([resultStub, resultStub2])
    const response = dossiersRepository.queryByIds(query2)
    response.then((resolvedResponse) => {
      expect(resolvedResponse).toEqual([record, record2])
    })
  })

  it('handles empty response', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = dossiersRepository.queryByIds(query)
    response.then((resolvedResponse) => {
      expect(resolvedResponse).toEqual([])
    })
  })

  it('handles API errors', async () => {
    apiClient.fetchJson.mockRejectedValueOnce(new Error('API Error'))
    await expect(dossiersRepository.queryByIds(query)).rejects.toThrow(
      'API Error',
    )
  })
})

describe('DossiersRepository - searchSuggestions', () => {
  const suggestionStub = {
    id: 'D001',
    description: 'Test dossier suggestion',
  }
  const suggestion = new DossierRecordSuggestion(suggestionStub)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches suggestions successfully', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([suggestionStub])
    const response = await dossiersRepository.searchSuggestions('test')
    expect(response).toEqual([suggestion])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test',
      false,
    )
  })

  it('handles empty query string', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.searchSuggestions('')
    expect(response).toEqual([])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=',
      false,
    )
  })

  it('handles empty response', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.searchSuggestions('nonexistent')
    expect(response).toEqual([])
  })

  it('handles multiple suggestions', async () => {
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
    apiClient.fetchJson.mockRejectedValueOnce(new Error('Search Error'))
    await expect(dossiersRepository.searchSuggestions('test')).rejects.toThrow(
      'Search Error',
    )
  })

  it('constructs URL correctly with special characters', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    await dossiersRepository.searchSuggestions('test query')
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/suggestions?q=test%20query',
      false,
    )
  })

  it('filters suggestions by fetching filtered dossiers when filters provided', async () => {
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

describe('Dossiers Repository - fetchFilteredDossiers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns all dossiers when no filters provided', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({})
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/dossiers', false)
  })

  it('returns all dossiers when filters are empty strings', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: '',
      scriptPeriod: '',
      genre: '',
    })
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/dossiers', false)
  })

  it('fetches filtered dossiers with provenance filter', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'Babylon',
    })
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/filter?provenance=Babylon',
      false,
    )
  })

  it('fetches filtered dossiers with scriptPeriod filter', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({
      scriptPeriod: 'Neo-Assyrian',
    })
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/filter?scriptPeriod=Neo-Assyrian',
      false,
    )
  })

  it('fetches filtered dossiers with genre filter', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({
      genre: 'Literary',
    })
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/filter?genre=Literary',
      false,
    )
  })

  it('fetches filtered dossiers with multiple filters', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'Babylon',
      scriptPeriod: 'Neo-Assyrian',
      genre: 'Literary',
    })
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/filter?genre=Literary&provenance=Babylon&scriptPeriod=Neo-Assyrian',
      false,
    )
  })

  it('handles response with dossiers wrapper', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      dossiers: [resultStub],
      totalCount: 1,
    })
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'Babylon',
    })
    expect(response).toEqual([record])
  })

  it('handles non-array response gracefully', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({ invalid: 'response' })
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'Babylon',
    })
    expect(response).toEqual([])
  })

  it('falls back to fetchAllDossiers when filter endpoint fails', async () => {
    apiClient.fetchJson
      .mockRejectedValueOnce(new Error('Filter endpoint not found'))
      .mockResolvedValueOnce([resultStub])

    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'Babylon',
    })

    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
    expect(apiClient.fetchJson).toHaveBeenNthCalledWith(
      1,
      '/dossiers/filter?provenance=Babylon',
      false,
    )
    expect(apiClient.fetchJson).toHaveBeenNthCalledWith(2, '/dossiers', false)
  })

  it('handles empty results', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'NonExistent',
    })
    expect(response).toEqual([])
  })
})

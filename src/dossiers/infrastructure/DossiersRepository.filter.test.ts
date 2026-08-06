import {
  createDossiersRepositoryTestContext,
  DossiersRepositoryTestContext,
  record,
  resultStub,
} from 'dossiers/infrastructure/DossiersRepository.testSupport'

jest.mock('http/ApiClient')
jest.mock('dossiers/application/DossiersService')

let context: DossiersRepositoryTestContext

beforeEach(() => {
  jest.clearAllMocks()
  context = createDossiersRepositoryTestContext()
})

describe('Dossiers Repository - fetchFilteredDossiers', () => {
  it('returns all dossiers when no filters provided', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({})
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers',
      false,
      undefined,
    )
  })

  it('returns all dossiers when filters are empty strings', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: '',
      scriptPeriod: '',
      genre: '',
    })
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers',
      false,
      undefined,
    )
  })

  it('fetches filtered dossiers with provenance filter', async () => {
    const { apiClient, dossiersRepository } = context
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
    const { apiClient, dossiersRepository } = context
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
    const { apiClient, dossiersRepository } = context
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
    const { apiClient, dossiersRepository } = context
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
    const { apiClient, dossiersRepository } = context
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
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce({ invalid: 'response' })
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'Babylon',
    })
    expect(response).toEqual([])
  })

  it('falls back to fetchAllDossiers when filter endpoint fails', async () => {
    const { apiClient, dossiersRepository } = context
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
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
    expect(apiClient.fetchJson).toHaveBeenNthCalledWith(
      2,
      '/dossiers',
      false,
      undefined,
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to fetch filtered dossiers:',
      'Filter endpoint not found',
    )

    consoleWarnSpy.mockRestore()
  })

  it('handles empty results', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.fetchFilteredDossiers({
      provenance: 'NonExistent',
    })
    expect(response).toEqual([])
  })
})

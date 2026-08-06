import DossierRecord from 'dossiers/domain/DossierRecord'
import {
  createDossiersRepositoryTestContext,
  DossiersRepositoryTestContext,
  record,
  resultStub,
} from 'dossiers/infrastructure/DossiersRepository.testSupport'

jest.mock('http/ApiClient')
jest.mock('dossiers/application/DossiersService')

const query = ['test', 'test2']

let context: DossiersRepositoryTestContext

beforeEach(() => {
  jest.clearAllMocks()
  context = createDossiersRepositoryTestContext()
})

describe('DossiersRepository - fetchAllDossiers', () => {
  it('fetches all dossiers without errors', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.fetchAllDossiers()
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers',
      false,
      undefined,
    )
  })

  it('handles response with dossiers wrapper', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce({
      dossiers: [resultStub],
      totalCount: 1,
    })
    const response = await dossiersRepository.fetchAllDossiers()
    expect(response).toEqual([record])
  })

  it('handles empty response', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.fetchAllDossiers()
    expect(response).toEqual([])
  })

  it('handles API errors gracefully', async () => {
    const { apiClient, dossiersRepository } = context
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    apiClient.fetchJson.mockRejectedValueOnce(new Error('API Error'))

    const response = await dossiersRepository.fetchAllDossiers()

    expect(response).toEqual([])
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to fetch dossiers:',
      'API Error',
    )

    consoleWarnSpy.mockRestore()
  })
})

describe('DossiersRepository - search by ids', () => {
  it('handles search without errors', () => {
    const { apiClient, dossiersRepository } = context
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
    const { apiClient, dossiersRepository } = context
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
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = dossiersRepository.queryByIds(query)
    response.then((resolvedResponse) => {
      expect(resolvedResponse).toEqual([])
    })
  })

  it('handles API errors', async () => {
    const { apiClient, dossiersRepository } = context
    apiClient.fetchJson.mockRejectedValueOnce(new Error('API Error'))
    await expect(dossiersRepository.queryByIds(query)).rejects.toThrow(
      'API Error',
    )
  })
})

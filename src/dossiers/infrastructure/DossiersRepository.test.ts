import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
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

describe('DossiersRepository - search by ids', () => {
  it('handles search without errors', () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = dossiersRepository.queryByIds(query)
    response.then((resolvedResponse) => {
      expect(resolvedResponse).toEqual([record])
    })

    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers?ids[]=test&ids[]=test2',
      false
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
      'API Error'
    )
  })
})

describe('DossiersRepository - searchDossier', () => {
  it('handles search without errors', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = await dossiersRepository.searchDossier('test')
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/search?q=test',
      false
    )
  })

  it('handles empty query string', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.searchDossier('')
    expect(response).toEqual([])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/search?q=',
      false
    )
  })

  it('handles empty response', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await dossiersRepository.searchDossier('nonexistent')
    expect(response).toEqual([])
  })

  it('handles multiple results', async () => {
    const resultStub2 = {
      ...resultStub,
      _id: 'test2',
      description: 'another description',
    }
    const record2 = new DossierRecord(resultStub2)
    apiClient.fetchJson.mockResolvedValueOnce([resultStub, resultStub2])
    const response = await dossiersRepository.searchDossier('test')
    expect(response).toEqual([record, record2])
  })

  it('handles API errors', async () => {
    apiClient.fetchJson.mockRejectedValueOnce(new Error('Search Error'))
    await expect(dossiersRepository.searchDossier('test')).rejects.toThrow(
      'Search Error'
    )
  })

  it('constructs URL correctly with special characters', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    await dossiersRepository.searchDossier('test query')
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/dossiers/search?q=test%20query',
      false
    )
  })
})

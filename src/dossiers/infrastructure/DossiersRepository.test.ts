import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import ApiClient from 'http/ApiClient'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'
import { referenceFactory } from 'test-support/bibliography-fixtures'

jest.mock('http/ApiClient')
jest.mock('dossiers/application/DossiersService')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const dossiersRepository = new DossiersRepository(apiClient)

const resultStub = {
  id: 'test',
  description: 'some description',
  isApproximateDate: true,
  yearRangeFrom: -500,
  yearRangeTo: -470,
  relatedKings: [10.2, 11],
  provenance: Provenances.Assyria,
  script: {
    period: Periods['Neo-Assyrian'],
    periodModifier: PeriodModifiers.None,
    uncertain: false,
  },
  references: [referenceFactory.build()],
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

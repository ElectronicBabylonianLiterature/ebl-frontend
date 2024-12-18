import { testDelegation, TestData } from 'test-support/utils'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { stringify } from 'query-string'
import ApiClient from 'http/ApiClient'
import { PeriodModifiers, Periods } from 'common/period'
import { ReferenceType } from 'bibliography/domain/Reference'
import { Provenances } from 'corpus/domain/provenance'

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
  references: ['EDITION' as ReferenceType, 'DISCUSSION' as ReferenceType],
}

const query = ['test']
const record = new DossierRecord(resultStub)

const testData: TestData<DossiersRepository>[] = [
  new TestData(
    'queryByIds',
    [stringify(query)],
    apiClient.fetchJson,
    [record],
    [`/dossiers?${stringify({ ids: query })}`, false],
    Promise.resolve([resultStub])
  ),
]

describe('dossiersService', () => testDelegation(dossiersRepository, testData))

describe('DossiersRepository - search by ids', () => {
  it('handles search without errors', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([resultStub])
    const response = dossiersRepository.queryByIds(query)
    expect(response).toEqual([record])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `/dossiers?${stringify({ ids: query })}`,
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
    expect(response).toEqual([record, record2])
  })

  it('handles empty response', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = dossiersRepository.queryByIds(query)
    expect(response).toEqual([])
  })

  it('handles API errors', async () => {
    apiClient.fetchJson.mockRejectedValueOnce(new Error('API Error'))
    await expect(dossiersRepository.queryByIds(query)).rejects.toThrow(
      'API Error'
    )
  })
})

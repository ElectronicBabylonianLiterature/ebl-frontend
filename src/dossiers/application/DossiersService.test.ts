import { testDelegation, TestData } from 'test-support/utils'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { stringify } from 'query-string'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { DossierSearchResult } from 'dossiers/domain/DossierSearchResult'

jest.mock('dossiers/infrastructure/DossiersRepository')
const dossiersRepository = new (DossiersRepository as jest.Mock)()

const dossiersService = new DossiersService(dossiersRepository)

const resultStub = {
  _id: 'test',
  description: 'some desciption',
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
  references: [referenceFactory.build()],
}

const query = { ids: ['test'] }
const entry = new DossierRecord(resultStub)

const testData: TestData<DossiersService>[] = [
  new TestData(
    'queryByIds',
    [stringify(query, { arrayFormat: 'index' })],
    dossiersRepository.queryByIds,
    [entry],
    [stringify(query, { arrayFormat: 'index' })],
    Promise.resolve([entry]),
  ),
]

describe('DossiersService', () => {
  testDelegation(dossiersService, testData)

  describe('search', () => {
    it('delegates search to repository and returns pagination result', async () => {
      const searchQuery = { searchText: 'sargon' }
      const searchResult: DossierSearchResult = {
        totalCount: 1,
        dossiers: [entry],
      }

      dossiersRepository.search.mockResolvedValueOnce(searchResult)

      const result = await dossiersService.search(searchQuery)

      expect(result).toEqual(searchResult)
      expect(result.totalCount).toBe(1)
      expect(result.dossiers).toHaveLength(1)
      expect(dossiersRepository.search).toHaveBeenCalledWith(searchQuery)
    })
  })
})

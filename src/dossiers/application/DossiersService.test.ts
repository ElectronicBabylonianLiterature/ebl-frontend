import { testDelegation, TestData } from 'test-support/utils'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { stringify } from 'query-string'
import { Provenances } from 'corpus/domain/provenance'
import { PeriodModifiers, Periods } from 'common/period'
import { referenceFactory } from 'test-support/bibliography-fixtures'

jest.mock('dossiers/infrastructure/DossiersRepository')
const dossiersRepository = new (DossiersRepository as jest.Mock)()

const dossiersService = new DossiersService(dossiersRepository)

const resultStub = {
  id: 'test',
  description: 'some desciption',
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

const query = { ids: ['test'] }
const entry = new DossierRecord(resultStub)

const testData: TestData<DossiersService>[] = [
  new TestData(
    'queryByIds',
    [stringify(query, { arrayFormat: 'index' })],
    dossiersRepository.queryByIds,
    [entry],
    [stringify(query, { arrayFormat: 'index' })],
    Promise.resolve([entry])
  ),
]

describe('DossiersService', () => {
  testDelegation(dossiersService, testData)
})

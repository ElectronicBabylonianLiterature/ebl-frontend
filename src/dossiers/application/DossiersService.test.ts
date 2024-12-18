import { testDelegation, TestData } from 'test-support/utils'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { stringify } from 'query-string'
import { ReferenceType } from 'bibliography/domain/Reference'
import { Provenances } from 'corpus/domain/provenance'
import { PeriodModifiers, Periods } from 'common/period'

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
  references: ['EDITION' as ReferenceType, 'DISCUSSION' as ReferenceType],
}

const query = { ids: ['test'] }
const entry = new DossierRecord(resultStub)

const testData: TestData<DossiersService>[] = [
  new TestData(
    'queryByIds',
    [stringify(query)],
    dossiersRepository.queryByIds,
    [entry],
    [stringify(query)],
    Promise.resolve([entry])
  ),
]

describe('DossiersService', () => {
  testDelegation(dossiersService, testData)
})

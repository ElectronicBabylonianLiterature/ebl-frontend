import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import ApiClient from 'http/ApiClient'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'

export const resultStub = {
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

export const record = new DossierRecord(resultStub)

export interface DossiersRepositoryTestContext {
  apiClient: jest.Mocked<ApiClient>
  dossiersRepository: DossiersRepository
}

export function createDossiersRepositoryTestContext(): DossiersRepositoryTestContext {
  const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()

  return {
    apiClient: apiClient,
    dossiersRepository: new DossiersRepository(apiClient),
  }
}

import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import ApiClient from 'http/ApiClient'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

export function createRealiaRepositoryTestContext(): {
  apiClient: jest.Mocked<ApiClient>
  realiaRepository: RealiaRepository
} {
  const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
  const realiaRepository = new RealiaRepository(apiClient)
  return { apiClient, realiaRepository }
}

export const entryDto = {
  _id: 'Pig',
  realiaId: 'realia_pig',
  relatedTerms: ['Schwein'],
  type: ['Objects'],
  wikidataId: ['Q787'],
  afoRegister: [
    {
      mainWord: 'Schwein',
      note: 'S.zucht',
      afoVolume: 'AfO 52',
      page: '645',
      AfO: 'AfO 52 (2018), 645',
      reference: '(2018) 645',
      crossReference: '',
      crossReferences: [],
    },
  ],
  reallexikon: [],
  crossReferences: [],
  afoCrossReferences: [],
  references: [],
}

export const expectedEntry: RealiaEntry = {
  id: 'Pig',
  realiaId: 'realia_pig',
  relatedTerms: ['Schwein'],
  type: ['Objects'],
  wikidataId: ['Q787'],
  afoRegister: [
    {
      mainWord: 'Schwein',
      note: 'S.zucht',
      afoVolume: 'AfO 52',
      year: '2018',
      page: '645',
      AfO: 'AfO 52 (2018), 645',
      reference: '(2018) 645',
      crossReference: '',
      crossReferences: [],
    },
  ],
  reallexikon: [],
  crossReferences: [],
  afoCrossReferences: [],
  references: [],
}

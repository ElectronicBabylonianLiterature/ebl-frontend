import { testDelegation, TestData } from 'test-support/utils'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import RealiaService from 'realia/application/RealiaService'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

jest.mock('realia/infrastructure/RealiaRepository')

const realiaRepository = new (RealiaRepository as jest.Mock)()
const realiaService = new RealiaService(realiaRepository)

const entry: RealiaEntry = {
  id: 'Pig',
  realiaId: 'realia_pig',
  relatedTerms: ['Schwein'],
  type: ['Objects'],
  wikidataId: [],
  afoRegister: [],
  reallexikon: [],
  crossReferences: [],
  afoCrossReferences: [],
  references: [],
}

const testData: TestData<RealiaService>[] = [
  new TestData(
    'find',
    ['Pig'],
    realiaRepository.find,
    entry,
    ['Pig'],
    Promise.resolve(entry),
  ),
  new TestData(
    'search',
    ['pig'],
    realiaRepository.search,
    [entry],
    ['pig'],
    Promise.resolve([entry]),
  ),
]

describe('RealiaService', () => testDelegation(realiaService, testData))

import { testDelegation, TestData } from 'test-support/utils'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import RealiaService from 'realia/application/RealiaService'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import Promise from 'bluebird'

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

describe('RealiaService.find resolution', () => {
  beforeEach(() => jest.clearAllMocks())

  it('resolves a realiaId through the by-id endpoint', async () => {
    realiaRepository.findByRealiaId.mockReturnValue(Promise.resolve(entry))

    await expect(realiaService.find('realia_000846')).resolves.toEqual(entry)
    expect(realiaRepository.findByRealiaId).toHaveBeenCalledWith(
      'realia_000846',
    )
    expect(realiaRepository.find).not.toHaveBeenCalled()
  })

  it('resolves a lemma through the lemma endpoint', async () => {
    realiaRepository.find.mockReturnValue(Promise.resolve(entry))

    await expect(realiaService.find('Pig')).resolves.toEqual(entry)
    expect(realiaRepository.find).toHaveBeenCalledWith('Pig')
    expect(realiaRepository.findByRealiaId).not.toHaveBeenCalled()
  })
})

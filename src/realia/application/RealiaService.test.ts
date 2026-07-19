import { testDelegation, TestData } from 'test-support/utils'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import RealiaService from 'realia/application/RealiaService'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import Promise from 'bluebird'

jest.mock('realia/infrastructure/RealiaRepository')

const realiaRepository = new (RealiaRepository as jest.Mock)()

function createService(): RealiaService {
  return new RealiaService(realiaRepository)
}

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

describe('RealiaService', () => testDelegation(createService, testData))

describe('RealiaService.find resolution', () => {
  let realiaService: RealiaService

  beforeEach(() => {
    jest.clearAllMocks()
    realiaService = createService()
  })

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

describe('RealiaService.find caching', () => {
  let realiaService: RealiaService

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    realiaService = createService()
    realiaRepository.find.mockReturnValue(Promise.resolve(entry))
    realiaRepository.findByRealiaId.mockReturnValue(Promise.resolve(entry))
  })

  afterEach(() => jest.useRealTimers())

  it('serves the canonical lemma from the cache after resolving by realiaId', async () => {
    await realiaService.find('realia_000846')

    await expect(realiaService.find('Pig')).resolves.toEqual(entry)
    expect(realiaRepository.findByRealiaId).toHaveBeenCalledTimes(1)
    expect(realiaRepository.find).not.toHaveBeenCalled()
  })

  it('serves a repeated lookup of the requested id from the cache', async () => {
    await realiaService.find('Pig')
    await realiaService.find('Pig')

    expect(realiaRepository.find).toHaveBeenCalledTimes(1)
  })

  it('refetches once the cached entry has expired', async () => {
    await realiaService.find('Pig')
    jest.advanceTimersByTime(5 * 60 * 1000 + 1)

    await expect(realiaService.find('Pig')).resolves.toEqual(entry)
    expect(realiaRepository.find).toHaveBeenCalledTimes(2)
  })

  it('does not leak entries between service instances', async () => {
    await realiaService.find('Pig')
    await createService().find('Pig')

    expect(realiaRepository.find).toHaveBeenCalledTimes(2)
  })
})

import Bluebird from 'bluebird'
import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ApiError } from 'http/ApiClient'

jest.mock('bibliography/infrastructure/BibliographyRepository', () => {
  return function () {
    return {
      find: jest.fn(),
      findMany: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      listAllBibliography: jest.fn(),
    }
  }
})

describe('BibliographyService', () => {
  const bibliographyRepository = new (BibliographyRepository as jest.Mock<
    jest.Mocked<BibliographyRepository>
  >)()

  const entryA = new BibliographyEntry({ id: 'RN1', title: 'Entry A' })
  const entryB = new BibliographyEntry({ id: 'RN2', title: 'Entry B' })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('caches find lookups by id', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.find.mockResolvedValue(entryA)

    await expect(service.find('RN1')).resolves.toBe(entryA)
    await expect(service.find('RN1')).resolves.toBe(entryA)

    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.find).toHaveBeenCalledWith('RN1')
  })

  test('deduplicates findMany ids while preserving requested order', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockResolvedValue([entryA, entryB])

    await expect(service.findMany(['RN2', 'RN1', 'RN1'])).resolves.toEqual([
      entryB,
      entryA,
      entryA,
    ])

    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.findMany).toHaveBeenCalledWith(['RN1', 'RN2'])
  })

  test('reuses in-flight find request in findMany', async () => {
    const service = new BibliographyService(bibliographyRepository)
    let resolveFind: ((entry: BibliographyEntry) => void) | undefined
    bibliographyRepository.find.mockReturnValue(
      new Bluebird((resolve) => {
        resolveFind = resolve
      }),
    )

    const inFlightFind = service.find('RN1')
    const inFlightFindMany = service.findMany(['RN1'])

    resolveFind?.(entryA)

    await expect(inFlightFind).resolves.toBe(entryA)
    await expect(inFlightFindMany).resolves.toEqual([entryA])
    expect(bibliographyRepository.findMany).not.toHaveBeenCalled()
  })

  test('clears cached bibliography values when scope changes', async () => {
    const scope = { current: 'guest' }
    const service = new BibliographyService(
      bibliographyRepository,
      () => scope.current,
    )

    bibliographyRepository.find
      .mockResolvedValueOnce(entryA)
      .mockResolvedValueOnce(entryA)

    await expect(service.find('RN1')).resolves.toBe(entryA)
    await expect(service.find('RN1')).resolves.toBe(entryA)

    scope.current = 'authenticated:user-a'

    await expect(service.find('RN1')).resolves.toBe(entryA)

    expect(bibliographyRepository.find).toHaveBeenCalledTimes(2)
  })

  test('returns an empty requested-id map without a repository request', async () => {
    const service = new BibliographyService(bibliographyRepository)

    await expect(service.findManyById([])).resolves.toEqual(new Map())
    expect(bibliographyRepository.findMany).not.toHaveBeenCalled()
  })

  test('delegates search and bibliography listing', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.search.mockResolvedValue([entryA])
    bibliographyRepository.listAllBibliography.mockResolvedValue(['RN1'])

    await expect(service.search('Aššur')).resolves.toEqual([entryA])
    await expect(service.listAllBibliography()).resolves.toEqual(['RN1'])
    expect(bibliographyRepository.search).toHaveBeenCalledWith('Aššur')
    expect(bibliographyRepository.listAllBibliography).toHaveBeenCalledTimes(1)
  })

  test('reuses a cached direct entry in findMany', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.find.mockResolvedValue(entryA)

    await expect(service.find(entryA.id)).resolves.toBe(entryA)
    await expect(service.findMany([entryA.id])).resolves.toEqual([entryA])
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.findMany).not.toHaveBeenCalled()
  })

  test('omits a concurrent direct 404 from findMany', async () => {
    const error = new ApiError('Not Found', {}, 404)
    let rejectFind = (_error: Error): void => {
      throw new Error('Find promise was not initialized')
    }
    bibliographyRepository.find.mockReturnValue(
      new Bluebird((_, reject) => {
        rejectFind = reject
      }),
    )
    const service = new BibliographyService(bibliographyRepository)

    const directRequest = service.find('missing-entry')
    const findManyRequest = service.findMany(['missing-entry'])
    const directExpectation = expect(directRequest).rejects.toBe(error)
    rejectFind(error)

    await directExpectation
    await expect(findManyRequest).resolves.toEqual([])
    expect(bibliographyRepository.findMany).not.toHaveBeenCalled()
  })

  test('propagates a concurrent direct systemic error through findMany', async () => {
    const error = new Error('Network unavailable')
    let rejectFind = (_error: Error): void => {
      throw new Error('Find promise was not initialized')
    }
    bibliographyRepository.find.mockReturnValue(
      new Bluebird((_, reject) => {
        rejectFind = reject
      }),
    )
    const service = new BibliographyService(bibliographyRepository)

    const directRequest = service.find(entryA.id)
    const findManyRequest = service.findMany([entryA.id])
    const directExpectation = expect(directRequest).rejects.toBe(error)
    const findManyExpectation = expect(findManyRequest).rejects.toBe(error)
    rejectFind(error)

    await directExpectation
    await findManyExpectation
    expect(bibliographyRepository.findMany).not.toHaveBeenCalled()
  })

  test('shares a batch fallback 404 with an overlapping findMany', async () => {
    const error = new ApiError('Not Found', {}, 404)
    let resolveBatch = (_entries: readonly BibliographyEntry[]): void => {
      throw new Error('Batch promise was not initialized')
    }
    bibliographyRepository.findMany.mockReturnValue(
      new Bluebird((resolve) => {
        resolveBatch = resolve
      }),
    )
    bibliographyRepository.find.mockRejectedValue(error)
    const service = new BibliographyService(bibliographyRepository)

    const firstRequest = service.findMany(['missing-entry'])
    const secondRequest = service.findMany(['missing-entry'])
    resolveBatch([])

    await expect(firstRequest).resolves.toEqual([])
    await expect(secondRequest).resolves.toEqual([])
    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
  })

  test('uses the default scope when scope resolution throws', async () => {
    let shouldThrow = true
    const getCacheScope = (): string => {
      if (shouldThrow) {
        throw new Error('Session unavailable')
      }
      return 'default'
    }
    const service = new BibliographyService(
      bibliographyRepository,
      getCacheScope,
    )
    bibliographyRepository.find.mockResolvedValue(entryA)

    await expect(service.find(entryA.id)).resolves.toBe(entryA)
    shouldThrow = false
    await expect(service.find(entryA.id)).resolves.toBe(entryA)
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
  })
})

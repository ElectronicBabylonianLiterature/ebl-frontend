import BibliographyService from 'bibliography/application/BibliographyService'
import { createBibliographyRepositoryMock } from 'bibliography/application/BibliographyService.testSupport'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ApiError } from 'http/ApiClient'

describe('BibliographyService', () => {
  const bibliographyRepository = createBibliographyRepositoryMock()

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

  test('deduplicates requested ids in the keyed result', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockResolvedValue([entryA, entryB])

    await expect(service.findManyById(['RN2', 'RN1', 'RN1'])).resolves.toEqual(
      new Map([
        [entryA.id, entryA],
        [entryB.id, entryB],
      ]),
    )

    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.findMany).toHaveBeenCalledWith(['RN1', 'RN2'])
  })

  test('reuses in-flight find request in findMany', async () => {
    const service = new BibliographyService(bibliographyRepository)
    let resolveFind: ((entry: BibliographyEntry) => void) | undefined
    bibliographyRepository.find.mockReturnValue(
      new Promise((resolve) => {
        resolveFind = resolve
      }),
    )

    const inFlightFind = service.find('RN1')
    const inFlightFindMany = service.findManyById(['RN1'])

    resolveFind?.(entryA)

    await expect(inFlightFind).resolves.toBe(entryA)
    await expect(inFlightFindMany).resolves.toEqual(
      new Map([[entryA.id, entryA]]),
    )
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
    expect(bibliographyRepository.search).toHaveBeenCalledWith(
      'Aššur',
      undefined,
    )
    expect(bibliographyRepository.listAllBibliography).toHaveBeenCalledTimes(1)
  })

  test('reuses a cached direct entry in findMany', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.find.mockResolvedValue(entryA)

    await expect(service.find(entryA.id)).resolves.toBe(entryA)
    await expect(service.findManyById([entryA.id])).resolves.toEqual(
      new Map([[entryA.id, entryA]]),
    )
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.findMany).not.toHaveBeenCalled()
  })

  test('omits a concurrent direct 404 from findMany', async () => {
    const error = new ApiError('Not Found', {}, 404)
    let rejectFind = (_error: Error): void => {
      throw new Error('Find promise was not initialized')
    }
    bibliographyRepository.find.mockReturnValue(
      new Promise((_, reject) => {
        rejectFind = reject
      }),
    )
    const service = new BibliographyService(bibliographyRepository)

    const directRequest = service.find('missing-entry')
    const findManyRequest = service.findManyById(['missing-entry'])
    const directExpectation = expect(directRequest).rejects.toBe(error)
    rejectFind(error)

    await directExpectation
    await expect(findManyRequest).resolves.toEqual(new Map())
    expect(bibliographyRepository.findMany).not.toHaveBeenCalled()
  })

  test('propagates a concurrent direct systemic error through findMany', async () => {
    const error = new Error('Network unavailable')
    let rejectFind = (_error: Error): void => {
      throw new Error('Find promise was not initialized')
    }
    bibliographyRepository.find.mockReturnValue(
      new Promise((_, reject) => {
        rejectFind = reject
      }),
    )
    const service = new BibliographyService(bibliographyRepository)

    const directRequest = service.find(entryA.id)
    const findManyRequest = service.findManyById([entryA.id])
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
      new Promise((resolve) => {
        resolveBatch = resolve
      }),
    )
    bibliographyRepository.find.mockRejectedValue(error)
    const service = new BibliographyService(bibliographyRepository)

    const firstRequest = service.findManyById(['missing-entry'])
    const secondRequest = service.findManyById(['missing-entry'])
    resolveBatch([])

    await expect(firstRequest).resolves.toEqual(new Map())
    await expect(secondRequest).resolves.toEqual(new Map())
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

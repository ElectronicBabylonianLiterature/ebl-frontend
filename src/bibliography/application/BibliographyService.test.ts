import BibliographyService from './BibliographyService'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

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
      new Promise((resolve) => {
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
})

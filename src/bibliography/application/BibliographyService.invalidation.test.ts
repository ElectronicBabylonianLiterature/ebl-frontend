import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

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

describe('BibliographyService mutation invalidation', () => {
  const bibliographyRepository = new (BibliographyRepository as jest.Mock<
    jest.Mocked<BibliographyRepository>
  >)()
  const aliasA = 'former-entry-id'
  const aliasB = 'earlier-entry-id'
  const staleEntry = new BibliographyEntry({
    id: 'canonical-entry-id',
    title: 'Stale title',
  })
  const freshEntry = new BibliographyEntry({
    id: staleEntry.id,
    title: 'Fresh title',
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('update invalidates every alias while caching the returned canonical entry', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockResolvedValue([])
    bibliographyRepository.find
      .mockResolvedValueOnce(staleEntry)
      .mockResolvedValueOnce(staleEntry)
      .mockResolvedValueOnce(freshEntry)
      .mockResolvedValueOnce(freshEntry)
    bibliographyRepository.update.mockResolvedValue(freshEntry)

    await expect(service.findManyById([aliasA, aliasB])).resolves.toEqual(
      new Map([
        [aliasA, staleEntry],
        [aliasB, staleEntry],
      ]),
    )
    await expect(service.update(freshEntry)).resolves.toBe(freshEntry)
    await expect(service.find(freshEntry.id)).resolves.toBe(freshEntry)
    await expect(service.findManyById([aliasA, aliasB])).resolves.toEqual(
      new Map([
        [aliasA, freshEntry],
        [aliasB, freshEntry],
      ]),
    )

    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(2)
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(4)
  })

  test('update invalidates an alias cached by direct find', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.find
      .mockResolvedValueOnce(staleEntry)
      .mockResolvedValueOnce(freshEntry)
    bibliographyRepository.update.mockResolvedValue(freshEntry)

    await expect(service.find(aliasA)).resolves.toBe(staleEntry)
    await expect(service.update(freshEntry)).resolves.toBe(freshEntry)
    await expect(service.find(aliasA)).resolves.toBe(freshEntry)

    expect(bibliographyRepository.find).toHaveBeenCalledTimes(2)
  })

  test('create invalidates aliases while caching the returned canonical entry', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.find
      .mockResolvedValueOnce(staleEntry)
      .mockResolvedValueOnce(freshEntry)
    bibliographyRepository.create.mockResolvedValue(freshEntry)

    await expect(service.find(aliasA)).resolves.toBe(staleEntry)
    await expect(service.create(freshEntry)).resolves.toBe(freshEntry)
    await expect(service.find(freshEntry.id)).resolves.toBe(freshEntry)
    await expect(service.find(aliasA)).resolves.toBe(freshEntry)

    expect(bibliographyRepository.find).toHaveBeenCalledTimes(2)
  })
})

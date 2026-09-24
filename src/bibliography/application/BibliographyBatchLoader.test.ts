import BibliographyBatchLoader from 'bibliography/application/BibliographyBatchLoader'
import {
  createBibliographyRepositoryMock,
  createDeferred,
} from 'bibliography/application/bibliographyService.testSupport'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ApiError } from 'http/ApiClient'

describe('BibliographyBatchLoader', () => {
  const bibliographyRepository = createBibliographyRepositoryMock()
  const cacheEntry = jest.fn<void, [string, BibliographyEntry, number]>()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('shares an exact repeated request', async () => {
    const entry = new BibliographyEntry({ id: 'RN1', title: 'Entry' })
    const batch = createDeferred<readonly BibliographyEntry[]>()
    bibliographyRepository.findMany.mockReturnValue(batch.promise)
    const loader = new BibliographyBatchLoader(
      bibliographyRepository,
      cacheEntry,
    )

    const firstRequest = loader.load([entry.id], 3)
    const secondRequest = loader.load([entry.id], 3)
    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(1)
    batch.resolve([entry])

    await expect(firstRequest).resolves.toEqual(new Map([[entry.id, entry]]))
    await expect(secondRequest).resolves.toEqual(new Map([[entry.id, entry]]))
    expect(cacheEntry).toHaveBeenCalledWith(entry.id, entry, 3)
  })

  test('does not share requests whose id sets have the same delimiter join', async () => {
    const combinedIdEntry = new BibliographyEntry({
      id: 'RN1|RN2',
      title: 'Combined id',
    })
    const firstEntry = new BibliographyEntry({ id: 'RN1', title: 'First' })
    const secondEntry = new BibliographyEntry({ id: 'RN2', title: 'Second' })
    bibliographyRepository.findMany
      .mockResolvedValueOnce([combinedIdEntry])
      .mockResolvedValueOnce([firstEntry, secondEntry])
    const loader = new BibliographyBatchLoader(
      bibliographyRepository,
      cacheEntry,
    )

    const combinedIdRequest = loader.load([combinedIdEntry.id], 3)
    const separateIdsRequest = loader.load([firstEntry.id, secondEntry.id], 3)

    await expect(combinedIdRequest).resolves.toEqual(
      new Map([[combinedIdEntry.id, combinedIdEntry]]),
    )
    await expect(separateIdsRequest).resolves.toEqual(
      new Map([
        [firstEntry.id, firstEntry],
        [secondEntry.id, secondEntry],
      ]),
    )
    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(2)
  })

  test('falls back for an id inherited from Object.prototype', async () => {
    const id = 'constructor'
    const entry = new BibliographyEntry({ id, title: 'Constructor entry' })
    bibliographyRepository.findMany.mockResolvedValue([])
    bibliographyRepository.find.mockResolvedValue(entry)
    const loader = new BibliographyBatchLoader(
      bibliographyRepository,
      cacheEntry,
    )

    await expect(loader.load([id], 3)).resolves.toEqual(new Map([[id, entry]]))
    expect(bibliographyRepository.find).toHaveBeenCalledWith(id)
  })

  test('keeps the first per-id request while registering new overlapping ids', async () => {
    const firstA = new BibliographyEntry({ id: 'RN1', title: 'First A' })
    const secondA = new BibliographyEntry({ id: 'RN1', title: 'Second A' })
    const entryB = new BibliographyEntry({ id: 'RN2', title: 'Entry B' })
    const entryC = new BibliographyEntry({ id: 'RN3', title: 'Entry C' })
    const firstBatch = createDeferred<readonly BibliographyEntry[]>()
    const secondBatch = createDeferred<readonly BibliographyEntry[]>()
    bibliographyRepository.findMany
      .mockReturnValueOnce(firstBatch.promise)
      .mockReturnValueOnce(secondBatch.promise)
    const loader = new BibliographyBatchLoader(
      bibliographyRepository,
      cacheEntry,
    )

    const firstRequest = loader.load([firstA.id, entryB.id], 4)
    const secondRequest = loader.load([secondA.id, entryC.id], 4)
    const inFlightA = loader.findInFlight(firstA.id)
    const inFlightC = loader.findInFlight(entryC.id)
    secondBatch.resolve([secondA, entryC])
    await expect(inFlightC).resolves.toBe(entryC)
    firstBatch.resolve([firstA, entryB])

    await expect(inFlightA).resolves.toBe(firstA)
    await expect(firstRequest).resolves.toEqual(
      new Map([
        [firstA.id, firstA],
        [entryB.id, entryB],
      ]),
    )
    await expect(secondRequest).resolves.toEqual(
      new Map([
        [secondA.id, secondA],
        [entryC.id, entryC],
      ]),
    )
  })

  test('shares a fallback 404 with direct and optional in-flight readers', async () => {
    const id = 'missing-entry'
    const error = new ApiError('Not Found', {}, 404)
    bibliographyRepository.findMany.mockResolvedValue([])
    bibliographyRepository.find.mockRejectedValue(error)
    const loader = new BibliographyBatchLoader(
      bibliographyRepository,
      cacheEntry,
    )

    const batchRequest = loader.load([id], 5)
    const directRequest = loader.findInFlight(id)
    const optionalRequest = loader.findManyInFlight(id)

    await expect(batchRequest).resolves.toEqual(new Map())
    await expect(directRequest).rejects.toBe(error)
    await expect(optionalRequest).resolves.toBeUndefined()
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
  })

  test('isolates a direct reader from an unrelated fallback failure', async () => {
    const foundEntry = new BibliographyEntry({ id: 'found-entry' })
    const missingId = 'failed-entry'
    const error = new ApiError('Server Error', {}, 500)
    const batch = createDeferred<readonly BibliographyEntry[]>()
    bibliographyRepository.findMany.mockReturnValue(batch.promise)
    bibliographyRepository.find.mockRejectedValue(error)
    const loader = new BibliographyBatchLoader(
      bibliographyRepository,
      cacheEntry,
    )

    const batchRequest = loader.load([foundEntry.id, missingId], 6)
    const directRequest = loader.findInFlight(foundEntry.id)
    batch.resolve([foundEntry])

    await expect(directRequest).resolves.toBe(foundEntry)
    await expect(batchRequest).rejects.toBe(error)
  })

  test('isolates an overlapping subset from an unrelated fallback failure', async () => {
    const foundEntry = new BibliographyEntry({ id: 'found-entry' })
    const missingId = 'failed-entry'
    const error = new ApiError('Server Error', {}, 500)
    const batch = createDeferred<readonly BibliographyEntry[]>()
    bibliographyRepository.findMany.mockReturnValue(batch.promise)
    bibliographyRepository.find.mockRejectedValue(error)
    const loader = new BibliographyBatchLoader(
      bibliographyRepository,
      cacheEntry,
    )

    const batchRequest = loader.load([foundEntry.id, missingId], 7)
    const subsetRequest = loader.findManyInFlight(foundEntry.id)
    batch.resolve([foundEntry])

    await expect(subsetRequest).resolves.toBe(foundEntry)
    await expect(batchRequest).rejects.toBe(error)
  })
})

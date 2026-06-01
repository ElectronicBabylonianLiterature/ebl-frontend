import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import Bluebird from 'bluebird'

jest.mock('dossiers/infrastructure/DossiersRepository')

const dossiersRepository =
  new (DossiersRepository as jest.Mock)() as jest.Mocked<DossiersRepository>
const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000

const createRecord = (id: string, description?: string): DossierRecord =>
  new DossierRecord({ _id: id, description })

const flushMicrotasks = () =>
  new Promise<void>((resolve) => {
    queueMicrotask(resolve)
  })

const suggestion = new DossierRecordSuggestion({
  id: 'D001',
  description: 'Test suggestion',
})

describe('DossiersService', () => {
  let dossiersService: DossiersService
  let cacheScope: string
  let currentTime: number

  beforeEach(() => {
    jest.clearAllMocks()
    cacheScope = 'guest'
    currentTime = 0
    dossiersService = new DossiersService(
      dossiersRepository,
      () => cacheScope,
      () => currentTime,
    )
  })

  it('batches concurrent queryByIds requests', async () => {
    const recordA = createRecord('A')
    const recordB = createRecord('B')
    const recordC = createRecord('C')
    dossiersRepository.queryByIds.mockResolvedValue([recordA, recordB, recordC])

    const firstRequest = dossiersService.queryByIds(['A', 'B'])
    const secondRequest = dossiersService.queryByIds(['B', 'C'])

    await expect(firstRequest).resolves.toEqual([recordA, recordB])
    await expect(secondRequest).resolves.toEqual([recordB, recordC])
    expect(dossiersRepository.queryByIds).toHaveBeenCalledTimes(1)
    expect(dossiersRepository.queryByIds).toHaveBeenCalledWith(['A', 'B', 'C'])
  })

  it('reuses in-flight result for duplicate ids requested while fetching', async () => {
    const recordA = createRecord('A')
    let resolveFirstRequest: ((records: DossierRecord[]) => void) | undefined
    dossiersRepository.queryByIds.mockImplementationOnce(
      () =>
        new Bluebird<DossierRecord[]>((resolve) => {
          resolveFirstRequest = resolve
        }),
    )

    const firstRequest = dossiersService.queryByIds(['A'])
    await flushMicrotasks()
    const secondRequest = dossiersService.queryByIds(['A'])

    expect(dossiersRepository.queryByIds).toHaveBeenCalledTimes(1)

    resolveFirstRequest?.([recordA])

    await expect(firstRequest).resolves.toEqual([recordA])
    await expect(secondRequest).resolves.toEqual([recordA])
    expect(dossiersRepository.queryByIds).toHaveBeenCalledTimes(1)
  })

  it('returns cached dossiers without calling repository', async () => {
    const recordA = createRecord('A')
    dossiersRepository.queryByIds.mockResolvedValueOnce([recordA])

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([recordA])
    dossiersRepository.queryByIds.mockClear()

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([recordA])
    expect(dossiersRepository.queryByIds).not.toHaveBeenCalled()
  })

  it('clears cached dossiers when auth scope changes', async () => {
    const guestRecord = createRecord('A', 'guest')
    const authenticatedRecord = createRecord('A', 'authenticated')
    dossiersRepository.queryByIds
      .mockResolvedValueOnce([guestRecord])
      .mockResolvedValueOnce([authenticatedRecord])

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([
      guestRecord,
    ])

    cacheScope = 'authenticated:user'

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([
      authenticatedRecord,
    ])
    expect(dossiersRepository.queryByIds).toHaveBeenNthCalledWith(1, ['A'])
    expect(dossiersRepository.queryByIds).toHaveBeenNthCalledWith(2, ['A'])

    dossiersRepository.queryByIds.mockClear()

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([
      authenticatedRecord,
    ])
    expect(dossiersRepository.queryByIds).not.toHaveBeenCalled()
  })

  it('does not leak in-flight query results into a new auth scope cache', async () => {
    const guestRecord = createRecord('A', 'guest')
    const authenticatedRecord = createRecord('A', 'authenticated')
    let resolveGuestRequest: ((records: DossierRecord[]) => void) | undefined
    dossiersRepository.queryByIds
      .mockImplementationOnce(
        () =>
          new Bluebird<DossierRecord[]>((resolve) => {
            resolveGuestRequest = resolve
          }),
      )
      .mockResolvedValueOnce([authenticatedRecord])

    const guestRequest = dossiersService.queryByIds(['A'])

    await flushMicrotasks()

    cacheScope = 'authenticated:user'

    const authenticatedRequest = dossiersService.queryByIds(['A'])

    resolveGuestRequest?.([guestRecord])

    await expect(guestRequest).resolves.toEqual([guestRecord])
    await expect(authenticatedRequest).resolves.toEqual([authenticatedRecord])

    dossiersRepository.queryByIds.mockClear()

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([
      authenticatedRecord,
    ])
    expect(dossiersRepository.queryByIds).not.toHaveBeenCalled()
  })

  it('refetches dossier ids after cache entry expires', async () => {
    const firstRecord = createRecord('A', 'first')
    const refreshedRecord = createRecord('A', 'refreshed')
    dossiersRepository.queryByIds.mockResolvedValueOnce([firstRecord])

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([
      firstRecord,
    ])

    dossiersRepository.queryByIds.mockClear()
    currentTime = cacheEntryLifetimeInMilliseconds - 1

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([
      firstRecord,
    ])
    expect(dossiersRepository.queryByIds).not.toHaveBeenCalled()

    dossiersRepository.queryByIds.mockResolvedValueOnce([refreshedRecord])
    currentTime = cacheEntryLifetimeInMilliseconds

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([
      refreshedRecord,
    ])
    expect(dossiersRepository.queryByIds).toHaveBeenCalledTimes(1)
    expect(dossiersRepository.queryByIds).toHaveBeenCalledWith(['A'])
  })

  it('evicts least recently used dossiers when cache limit is reached', async () => {
    const recordA = createRecord('A', 'A')
    const recordB = createRecord('B', 'B')
    const recordC = createRecord('C', 'C')
    const maximumCachedDossiers = 2
    dossiersService = new DossiersService(
      dossiersRepository,
      () => cacheScope,
      () => currentTime,
      maximumCachedDossiers,
    )

    dossiersRepository.queryByIds
      .mockResolvedValueOnce([recordA])
      .mockResolvedValueOnce([recordB])
      .mockResolvedValueOnce([recordC])

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([recordA])
    await expect(dossiersService.queryByIds(['B'])).resolves.toEqual([recordB])
    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([recordA])
    await expect(dossiersService.queryByIds(['C'])).resolves.toEqual([recordC])

    dossiersRepository.queryByIds.mockClear()
    dossiersRepository.queryByIds.mockResolvedValueOnce([recordB])

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([recordA])
    await expect(dossiersService.queryByIds(['B'])).resolves.toEqual([recordB])
    expect(dossiersRepository.queryByIds).toHaveBeenCalledTimes(1)
    expect(dossiersRepository.queryByIds).toHaveBeenCalledWith(['B'])
  })

  it('queries only missing dossier ids when partial cache exists', async () => {
    const recordA = createRecord('A')
    const recordB = createRecord('B')
    const recordC = createRecord('C')
    dossiersRepository.queryByIds
      .mockResolvedValueOnce([recordA, recordB])
      .mockResolvedValueOnce([recordC])

    await expect(dossiersService.queryByIds(['A', 'B'])).resolves.toEqual([
      recordA,
      recordB,
    ])
    await expect(dossiersService.queryByIds(['A', 'C'])).resolves.toEqual([
      recordA,
      recordC,
    ])

    expect(dossiersRepository.queryByIds).toHaveBeenNthCalledWith(1, ['A', 'B'])
    expect(dossiersRepository.queryByIds).toHaveBeenNthCalledWith(2, ['C'])
  })

  it('propagates batched query errors to all pending callers', async () => {
    dossiersRepository.queryByIds.mockRejectedValue(new Error('query failed'))

    const firstRequest = dossiersService.queryByIds(['A'])
    const secondRequest = dossiersService.queryByIds(['B'])

    await expect(firstRequest).rejects.toThrow('query failed')
    await expect(secondRequest).rejects.toThrow('query failed')
    expect(dossiersRepository.queryByIds).toHaveBeenCalledTimes(1)
    expect(dossiersRepository.queryByIds).toHaveBeenCalledWith(['A', 'B'])
  })

  it('returns empty array for empty query ids', async () => {
    await expect(dossiersService.queryByIds([])).resolves.toEqual([])
    expect(dossiersRepository.queryByIds).not.toHaveBeenCalled()
  })

  it('filters empty and duplicate ids before querying', async () => {
    const recordA = createRecord('A')
    dossiersRepository.queryByIds.mockResolvedValue([recordA])

    await expect(dossiersService.queryByIds(['', 'A', 'A'])).resolves.toEqual([
      recordA,
    ])
    expect(dossiersRepository.queryByIds).toHaveBeenCalledWith(['A'])
  })

  it('delegates searchSuggestions', async () => {
    dossiersRepository.searchSuggestions.mockResolvedValue([suggestion])

    await expect(dossiersService.searchSuggestions('test')).resolves.toEqual([
      suggestion,
    ])
    expect(dossiersRepository.searchSuggestions).toHaveBeenCalledWith(
      'test',
      undefined,
    )
  })

  it('delegates fetchAllDossiers', async () => {
    const records = [createRecord('A')]
    dossiersRepository.fetchAllDossiers.mockResolvedValue(records)

    await expect(dossiersService.fetchAllDossiers()).resolves.toEqual(records)
    expect(dossiersRepository.fetchAllDossiers).toHaveBeenCalledTimes(1)
  })

  it('delegates fetchFilteredDossiers', async () => {
    const records = [createRecord('A')]
    const filters = { genre: 'genre' }
    dossiersRepository.fetchFilteredDossiers.mockResolvedValue(records)

    await expect(
      dossiersService.fetchFilteredDossiers(filters),
    ).resolves.toEqual(records)
    expect(dossiersRepository.fetchFilteredDossiers).toHaveBeenCalledWith(
      filters,
    )
  })

  it('passes filters to searchSuggestions', async () => {
    const filters = { genre: 'Incantation', provenance: 'Babylon' }
    dossiersRepository.searchSuggestions.mockResolvedValue([suggestion])

    const result = await dossiersService.searchSuggestions('test', filters)

    expect(dossiersRepository.searchSuggestions).toHaveBeenCalledWith(
      'test',
      filters,
    )
    expect(result).toEqual([suggestion])
  })
})

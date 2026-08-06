import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'

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

describe('DossiersService caching', () => {
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

  it('rejects pending queryByIds requests when auth scope changes before flush', async () => {
    const authenticatedRecord = createRecord('A', 'authenticated')
    dossiersRepository.queryByIds.mockResolvedValueOnce([authenticatedRecord])

    const guestPendingRequest = dossiersService.queryByIds(['A'])

    cacheScope = 'authenticated:user'

    const authenticatedRequest = dossiersService.queryByIds(['A'])

    await expect(guestPendingRequest).rejects.toThrow(
      'DossiersService cache scope changed; pending queryByIds requests cancelled.',
    )
    await expect(authenticatedRequest).resolves.toEqual([authenticatedRecord])
    expect(dossiersRepository.queryByIds).toHaveBeenCalledTimes(1)
    expect(dossiersRepository.queryByIds).toHaveBeenCalledWith(['A'])
  })

  it('does not leak in-flight query results into a new auth scope cache', async () => {
    const guestRecord = createRecord('A', 'guest')
    const authenticatedRecord = createRecord('A', 'authenticated')
    let resolveGuestRequest: ((records: DossierRecord[]) => void) | undefined
    dossiersRepository.queryByIds
      .mockImplementationOnce(
        () =>
          new Promise<DossierRecord[]>((resolve) => {
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
})

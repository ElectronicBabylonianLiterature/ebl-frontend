import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'

jest.mock('dossiers/infrastructure/DossiersRepository')

const dossiersRepository =
  new (DossiersRepository as jest.Mock)() as jest.Mocked<DossiersRepository>
const createRecord = (id: string, description?: string): DossierRecord =>
  new DossierRecord({ _id: id, description })

const flushMicrotasks = () =>
  new Promise<void>((resolve) => {
    queueMicrotask(resolve)
  })

describe('DossiersService batching', () => {
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
        new Promise<DossierRecord[]>((resolve) => {
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
})

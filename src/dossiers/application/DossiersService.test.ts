import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'

jest.mock('dossiers/infrastructure/DossiersRepository')

const dossiersRepository =
  new (DossiersRepository as jest.Mock)() as jest.Mocked<DossiersRepository>

const createRecord = (id: string): DossierRecord =>
  new DossierRecord({ _id: id })

const suggestion = new DossierRecordSuggestion({
  id: 'D001',
  description: 'Test suggestion',
})

describe('DossiersService', () => {
  let dossiersService: DossiersService

  beforeEach(() => {
    jest.clearAllMocks()
    dossiersService = new DossiersService(dossiersRepository)
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

  it('returns cached dossiers without calling repository', async () => {
    const recordA = createRecord('A')
    dossiersRepository.queryByIds.mockResolvedValueOnce([recordA])

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([recordA])
    dossiersRepository.queryByIds.mockClear()

    await expect(dossiersService.queryByIds(['A'])).resolves.toEqual([recordA])
    expect(dossiersRepository.queryByIds).not.toHaveBeenCalled()
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

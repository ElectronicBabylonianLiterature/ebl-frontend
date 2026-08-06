import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'

jest.mock('dossiers/infrastructure/DossiersRepository')

const dossiersRepository =
  new (DossiersRepository as jest.Mock)() as jest.Mocked<DossiersRepository>

const createRecord = (id: string, description?: string): DossierRecord =>
  new DossierRecord({ _id: id, description })

const suggestion = new DossierRecordSuggestion({
  id: 'D001',
  description: 'Test suggestion',
})

describe('DossiersService delegation', () => {
  let dossiersService: DossiersService

  beforeEach(() => {
    jest.clearAllMocks()
    dossiersService = new DossiersService(dossiersRepository)
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

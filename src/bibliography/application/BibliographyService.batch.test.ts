import BibliographyService from 'bibliography/application/BibliographyService'
import { createBibliographyRepositoryMock } from 'bibliography/application/bibliographyService.testSupport'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ApiError } from 'http/ApiClient'

describe('BibliographyService partial batch results', () => {
  const bibliographyRepository = createBibliographyRepositoryMock()
  const samet = new BibliographyEntry({
    id: 'samet2014lamentation',
    title: 'Lamentation over the Destruction of Ur',
  })
  const attinger = new BibliographyEntry({
    id: 'attinger2015nouvelle',
    title: 'Nouvelle édition',
  })
  const missingId = 'attinger2014lamentation'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('keeps resolved siblings when one individual fallback returns 404', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockResolvedValue([samet, attinger])
    bibliographyRepository.find.mockRejectedValue(
      new ApiError('Not Found', {}, 404),
    )

    await expect(
      service.findMany([samet.id, missingId, attinger.id]),
    ).resolves.toEqual([samet, attinger])

    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.find).toHaveBeenCalledWith(missingId)
  })

  test('looks up each unique missing id once and preserves duplicates', async () => {
    const secondMissingId = 'unknown-lamentation'
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockResolvedValue([samet])
    bibliographyRepository.find.mockRejectedValue(
      new ApiError('Not Found', {}, 404),
    )
    await expect(
      service.findMany([missingId, samet.id, missingId, secondMissingId]),
    ).resolves.toEqual([samet])
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(2)
    expect(bibliographyRepository.find).toHaveBeenCalledWith(missingId)
    expect(bibliographyRepository.find).toHaveBeenCalledWith(secondMissingId)
  })

  test('retries an entry after its fallback returned 404', async () => {
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([samet])
    bibliographyRepository.find.mockRejectedValueOnce(
      new ApiError('Not Found', {}, 404),
    )

    await expect(service.findMany([samet.id])).resolves.toEqual([])
    await expect(service.findMany([samet.id])).resolves.toEqual([samet])

    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(2)
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
  })

  test('preserves requested alias slots and caches requested and canonical ids', async () => {
    const requestedId = 'former-entry-id'
    const canonicalEntry = new BibliographyEntry({
      id: 'canonical-entry-id',
      title: 'Canonical entry',
    })
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockResolvedValue([])
    bibliographyRepository.find.mockResolvedValue(canonicalEntry)

    await expect(service.findMany([requestedId, requestedId])).resolves.toEqual(
      [canonicalEntry, canonicalEntry],
    )
    await expect(service.find(requestedId)).resolves.toBe(canonicalEntry)
    await expect(service.find(canonicalEntry.id)).resolves.toBe(canonicalEntry)

    expect(bibliographyRepository.findMany).toHaveBeenCalledWith([requestedId])
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.find).toHaveBeenCalledWith(requestedId)
  })

  test('shares one fallback between concurrent findMany and find calls', async () => {
    const requestedId = 'former-entry-id'
    const canonicalEntry = new BibliographyEntry({ id: 'canonical-entry-id' })
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockResolvedValue([])
    bibliographyRepository.find.mockResolvedValue(canonicalEntry)

    const findManyRequest = service.findMany([requestedId])
    const findRequest = service.find(requestedId)

    await expect(findManyRequest).resolves.toEqual([canonicalEntry])
    await expect(findRequest).resolves.toBe(canonicalEntry)
    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
  })
})

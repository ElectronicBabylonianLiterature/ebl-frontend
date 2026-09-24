import BibliographyService from 'bibliography/application/BibliographyService'
import {
  createBibliographyRepositoryMock,
  createDeferred,
} from 'bibliography/application/bibliographyService.testSupport'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

describe('BibliographyService scope races', () => {
  const bibliographyRepository = createBibliographyRepositoryMock()
  const canonicalId = 'canonical-entry-id'
  const requestedAlias = 'former-entry-id'
  const staleEntry = new BibliographyEntry({
    id: canonicalId,
    title: 'Guest title',
  })
  const freshEntry = new BibliographyEntry({
    id: canonicalId,
    title: 'Authenticated title',
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('late base-batch result cannot cross scope or clear a newer request', async () => {
    const scope = { current: 'guest' }
    const guestBatch = createDeferred<readonly BibliographyEntry[]>()
    const authenticatedBatch = createDeferred<readonly BibliographyEntry[]>()
    const service = new BibliographyService(
      bibliographyRepository,
      () => scope.current,
    )
    bibliographyRepository.findMany
      .mockReturnValueOnce(guestBatch.promise)
      .mockReturnValueOnce(authenticatedBatch.promise)

    const guestRequest = service.findManyById([canonicalId])
    scope.current = 'authenticated:user-a'
    const authenticatedRequest = service.findManyById([canonicalId])
    guestBatch.resolve([staleEntry])
    await expect(guestRequest).resolves.toEqual(
      new Map([[canonicalId, staleEntry]]),
    )
    const sharedAuthenticatedRequest = service.findManyById([canonicalId])
    authenticatedBatch.resolve([freshEntry])

    await expect(authenticatedRequest).resolves.toEqual(
      new Map([[canonicalId, freshEntry]]),
    )
    await expect(sharedAuthenticatedRequest).resolves.toEqual(
      new Map([[canonicalId, freshEntry]]),
    )
    await expect(service.find(canonicalId)).resolves.toBe(freshEntry)
    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(2)
    expect(bibliographyRepository.find).not.toHaveBeenCalled()
  })

  test('late fallback result cannot cross scope or clear a newer request', async () => {
    const scope = { current: 'guest' }
    const guestFallback = createDeferred<BibliographyEntry>()
    const guestFallbackStarted = createDeferred<void>()
    const authenticatedFallback = createDeferred<BibliographyEntry>()
    const authenticatedFallbackStarted = createDeferred<void>()
    const service = new BibliographyService(
      bibliographyRepository,
      () => scope.current,
    )
    bibliographyRepository.findMany.mockResolvedValue([])
    bibliographyRepository.find
      .mockImplementationOnce(() => {
        guestFallbackStarted.resolve()
        return guestFallback.promise
      })
      .mockImplementationOnce(() => {
        authenticatedFallbackStarted.resolve()
        return authenticatedFallback.promise
      })

    const guestRequest = service.findManyById([requestedAlias])
    await guestFallbackStarted.promise
    scope.current = 'authenticated:user-a'
    const authenticatedRequest = service.findManyById([requestedAlias])
    await authenticatedFallbackStarted.promise
    guestFallback.resolve(staleEntry)
    await expect(guestRequest).resolves.toEqual(
      new Map([[requestedAlias, staleEntry]]),
    )
    const sharedAuthenticatedRequest = service.findManyById([requestedAlias])
    authenticatedFallback.resolve(freshEntry)

    await expect(authenticatedRequest).resolves.toEqual(
      new Map([[requestedAlias, freshEntry]]),
    )
    await expect(sharedAuthenticatedRequest).resolves.toEqual(
      new Map([[requestedAlias, freshEntry]]),
    )
    await expect(service.find(requestedAlias)).resolves.toBe(freshEntry)
    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(2)
    expect(bibliographyRepository.find).toHaveBeenCalledTimes(2)
  })
})

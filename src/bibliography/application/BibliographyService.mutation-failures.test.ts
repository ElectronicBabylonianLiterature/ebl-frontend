import Bluebird from 'bluebird'
import BibliographyService from 'bibliography/application/BibliographyService'
import {
  createBibliographyRepositoryMock,
  createDeferred,
} from 'bibliography/application/bibliographyService.testSupport'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

type Mutation = 'create' | 'update'

function setMutationResults(
  mutation: Mutation,
  bibliographyRepository: jest.Mocked<BibliographyRepository>,
  success: Bluebird<BibliographyEntry>,
  failure: Error,
): void {
  const repositoryMutation =
    mutation === 'create'
      ? bibliographyRepository.create
      : bibliographyRepository.update
  repositoryMutation
    .mockReturnValueOnce(success)
    .mockReturnValueOnce(Bluebird.reject(failure))
}

function mutate(
  mutation: Mutation,
  service: BibliographyService,
  entry: BibliographyEntry,
): Bluebird<BibliographyEntry> {
  return mutation === 'create' ? service.create(entry) : service.update(entry)
}

describe.each<Mutation>(['create', 'update'])(
  'BibliographyService %s success before newer failure',
  (mutation) => {
    const bibliographyRepository = createBibliographyRepositoryMock()
    const id = 'canonical-entry-id'
    const submittedEntry = new BibliographyEntry({ id, title: 'Submitted' })
    const cachedEntry = new BibliographyEntry({ id, title: 'Cached' })
    const successfulEntry = new BibliographyEntry({ id, title: 'Successful' })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('invalidates data cached before the successful mutation', async () => {
      const successfulResult = createDeferred<BibliographyEntry>()
      const failure = new Error('Newer mutation failed')
      const service = new BibliographyService(bibliographyRepository)
      bibliographyRepository.find.mockResolvedValue(cachedEntry)
      await expect(service.find(id)).resolves.toBe(cachedEntry)
      setMutationResults(
        mutation,
        bibliographyRepository,
        successfulResult.promise,
        failure,
      )

      const successfulRequest = mutate(mutation, service, submittedEntry)
      const failedRequest = mutate(mutation, service, submittedEntry)
      const failureExpectation = expect(failedRequest).rejects.toBe(failure)
      successfulResult.resolve(successfulEntry)

      await expect(successfulRequest).resolves.toBe(successfulEntry)
      await failureExpectation
      await expect(service.find(id)).resolves.toBe(successfulEntry)
      expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    })

    test('invalidates an in-flight read started before the successful mutation', async () => {
      const readResult = createDeferred<BibliographyEntry>()
      const successfulResult = createDeferred<BibliographyEntry>()
      const failure = new Error('Newer mutation failed')
      const service = new BibliographyService(bibliographyRepository)
      bibliographyRepository.find.mockReturnValue(readResult.promise)
      const staleRead = service.find(id)
      setMutationResults(
        mutation,
        bibliographyRepository,
        successfulResult.promise,
        failure,
      )

      const successfulRequest = mutate(mutation, service, submittedEntry)
      const failedRequest = mutate(mutation, service, submittedEntry)
      const failureExpectation = expect(failedRequest).rejects.toBe(failure)
      successfulResult.resolve(successfulEntry)
      await expect(successfulRequest).resolves.toBe(successfulEntry)
      await failureExpectation
      readResult.resolve(cachedEntry)

      await expect(staleRead).resolves.toBe(cachedEntry)
      await expect(service.find(id)).resolves.toBe(successfulEntry)
      expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    })

    test('cannot apply after an authenticated to guest to authenticated cycle', async () => {
      const scope = { current: 'authenticated:user-a' }
      const mutationResult = createDeferred<BibliographyEntry>()
      const guestEntry = new BibliographyEntry({ id, title: 'Guest' })
      const currentEntry = new BibliographyEntry({
        id,
        title: 'Current user A',
      })
      const service = new BibliographyService(
        bibliographyRepository,
        () => scope.current,
      )
      if (mutation === 'create') {
        bibliographyRepository.create.mockReturnValue(mutationResult.promise)
      } else {
        bibliographyRepository.update.mockReturnValue(mutationResult.promise)
      }
      bibliographyRepository.find
        .mockResolvedValueOnce(guestEntry)
        .mockResolvedValueOnce(currentEntry)

      const mutationRequest = mutate(mutation, service, submittedEntry)
      scope.current = 'guest'
      await expect(service.find(id)).resolves.toBe(guestEntry)
      scope.current = 'authenticated:user-a'
      await expect(service.find(id)).resolves.toBe(currentEntry)
      mutationResult.resolve(successfulEntry)

      await expect(mutationRequest).resolves.toBe(successfulEntry)
      await expect(service.find(id)).resolves.toBe(currentEntry)
      expect(bibliographyRepository.find).toHaveBeenCalledTimes(2)
    })
  },
)

test('a successful create applies when a newer update rejects', async () => {
  const bibliographyRepository = new (BibliographyRepository as jest.Mock<
    jest.Mocked<BibliographyRepository>
  >)()
  const id = 'canonical-entry-id'
  const cachedEntry = new BibliographyEntry({ id, title: 'Cached' })
  const createdEntry = new BibliographyEntry({ id, title: 'Created' })
  const submittedEntry = new BibliographyEntry({ id, title: 'Submitted' })
  const createResult = createDeferred<BibliographyEntry>()
  const updateFailure = new Error('Update failed')
  const service = new BibliographyService(bibliographyRepository)
  bibliographyRepository.find.mockResolvedValue(cachedEntry)
  await service.find(id)
  bibliographyRepository.create.mockReturnValue(createResult.promise)
  bibliographyRepository.update.mockRejectedValue(updateFailure)

  const createRequest = service.create(submittedEntry)
  const updateRequest = service.update(submittedEntry)
  const failureExpectation = expect(updateRequest).rejects.toBe(updateFailure)
  createResult.resolve(createdEntry)

  await expect(createRequest).resolves.toBe(createdEntry)
  await failureExpectation
  await expect(service.find(id)).resolves.toBe(createdEntry)
  expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
})

import Bluebird from 'bluebird'
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

interface Deferred<Value> {
  readonly promise: Bluebird<Value>
  readonly resolve: (value: Value) => void
}

type Mutation = 'create' | 'update'

function createDeferred<Value>(): Deferred<Value> {
  let resolvePromise = (_value: Value): void => {
    throw new Error('Deferred promise was not initialized')
  }
  const promise = new Bluebird<Value>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

function performMutation(
  mutation: Mutation,
  service: BibliographyService,
  bibliographyRepository: jest.Mocked<BibliographyRepository>,
  entry: BibliographyEntry,
): Bluebird<BibliographyEntry> {
  if (mutation === 'create') {
    bibliographyRepository.create.mockResolvedValue(entry)
    return service.create(entry)
  }
  bibliographyRepository.update.mockResolvedValue(entry)
  return service.update(entry)
}

describe.each<Mutation>(['create', 'update'])(
  'BibliographyService %s races',
  (mutation) => {
    const bibliographyRepository = new (BibliographyRepository as jest.Mock<
      jest.Mocked<BibliographyRepository>
    >)()
    const canonicalId = 'canonical-entry-id'
    const requestedAlias = 'former-entry-id'
    const staleEntry = new BibliographyEntry({
      id: canonicalId,
      title: 'Stale title',
    })
    const freshEntry = new BibliographyEntry({
      id: canonicalId,
      title: 'Fresh title',
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('late base-batch result settles for its caller without overwriting the mutation', async () => {
      const batch = createDeferred<readonly BibliographyEntry[]>()
      const service = new BibliographyService(bibliographyRepository)
      bibliographyRepository.findMany.mockReturnValue(batch.promise)

      const staleRequest = service.findManyById([canonicalId])
      await expect(
        performMutation(mutation, service, bibliographyRepository, freshEntry),
      ).resolves.toBe(freshEntry)
      batch.resolve([staleEntry])

      await expect(staleRequest).resolves.toEqual(
        new Map([[canonicalId, staleEntry]]),
      )
      await expect(service.find(canonicalId)).resolves.toBe(freshEntry)
      expect(bibliographyRepository.find).not.toHaveBeenCalled()
    })

    test('late fallback result settles for its caller without caching stale aliases', async () => {
      const fallback = createDeferred<BibliographyEntry>()
      const fallbackStarted = createDeferred<void>()
      const service = new BibliographyService(bibliographyRepository)
      bibliographyRepository.findMany.mockResolvedValue([])
      bibliographyRepository.find
        .mockImplementationOnce(() => {
          fallbackStarted.resolve()
          return fallback.promise
        })
        .mockResolvedValueOnce(freshEntry)

      const staleRequest = service.findManyById([requestedAlias])
      await fallbackStarted.promise
      await expect(
        performMutation(mutation, service, bibliographyRepository, freshEntry),
      ).resolves.toBe(freshEntry)
      fallback.resolve(staleEntry)

      await expect(staleRequest).resolves.toEqual(
        new Map([[requestedAlias, staleEntry]]),
      )
      await expect(service.find(canonicalId)).resolves.toBe(freshEntry)
      await expect(service.find(requestedAlias)).resolves.toBe(freshEntry)
      expect(bibliographyRepository.find).toHaveBeenCalledTimes(2)
    })
  },
)

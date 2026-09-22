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

function setMutationResult(
  mutation: Mutation,
  bibliographyRepository: jest.Mocked<BibliographyRepository>,
  result: Bluebird<BibliographyEntry>,
): void {
  if (mutation === 'create') {
    bibliographyRepository.create.mockReturnValueOnce(result)
  } else {
    bibliographyRepository.update.mockReturnValueOnce(result)
  }
}

function mutate(
  mutation: Mutation,
  service: BibliographyService,
  entry: BibliographyEntry,
): Bluebird<BibliographyEntry> {
  return mutation === 'create' ? service.create(entry) : service.update(entry)
}

const scopeChanges: ReadonlyArray<[string, string]> = [
  ['authenticated user switch', 'authenticated:user-b'],
  ['logout', 'guest'],
]

describe.each<Mutation>(['create', 'update'])(
  'BibliographyService %s completion races',
  (mutation) => {
    const bibliographyRepository = new (BibliographyRepository as jest.Mock<
      jest.Mocked<BibliographyRepository>
    >)()
    const id = 'canonical-entry-id'
    const submittedEntry = new BibliographyEntry({ id, title: 'Submitted' })
    const oldMutationEntry = new BibliographyEntry({
      id,
      title: 'Old mutation result',
    })
    const newScopeEntry = new BibliographyEntry({
      id,
      title: 'New scope result',
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    test.each(scopeChanges)(
      'cannot replace a cached read after %s',
      async (_, nextScope) => {
        const scope = { current: 'authenticated:user-a' }
        const mutationResult = createDeferred<BibliographyEntry>()
        const service = new BibliographyService(
          bibliographyRepository,
          () => scope.current,
        )
        setMutationResult(
          mutation,
          bibliographyRepository,
          mutationResult.promise,
        )
        bibliographyRepository.find.mockResolvedValue(newScopeEntry)

        const mutationRequest = mutate(mutation, service, submittedEntry)
        scope.current = nextScope
        await expect(service.find(id)).resolves.toBe(newScopeEntry)
        mutationResult.resolve(oldMutationEntry)

        await expect(mutationRequest).resolves.toBe(oldMutationEntry)
        await expect(service.find(id)).resolves.toBe(newScopeEntry)
        expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
      },
    )

    test('cannot clear a newer-scope in-flight read', async () => {
      const scope = { current: 'authenticated:user-a' }
      const mutationResult = createDeferred<BibliographyEntry>()
      const readResult = createDeferred<BibliographyEntry>()
      const service = new BibliographyService(
        bibliographyRepository,
        () => scope.current,
      )
      setMutationResult(
        mutation,
        bibliographyRepository,
        mutationResult.promise,
      )
      bibliographyRepository.find.mockReturnValue(readResult.promise)

      const mutationRequest = mutate(mutation, service, submittedEntry)
      scope.current = 'authenticated:user-b'
      const firstRead = service.find(id)
      mutationResult.resolve(oldMutationEntry)
      await expect(mutationRequest).resolves.toBe(oldMutationEntry)
      const sharedRead = service.find(id)
      readResult.resolve(newScopeEntry)

      await expect(firstRead).resolves.toBe(newScopeEntry)
      await expect(sharedRead).resolves.toBe(newScopeEntry)
      await expect(service.find(id)).resolves.toBe(newScopeEntry)
      expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    })

    test('older completion cannot overwrite a newer mutation', async () => {
      const olderResult = createDeferred<BibliographyEntry>()
      const newerResult = createDeferred<BibliographyEntry>()
      const newerEntry = new BibliographyEntry({ id, title: 'Newer result' })
      const service = new BibliographyService(bibliographyRepository)
      setMutationResult(mutation, bibliographyRepository, olderResult.promise)
      setMutationResult(mutation, bibliographyRepository, newerResult.promise)

      const olderRequest = mutate(mutation, service, submittedEntry)
      const newerRequest = mutate(mutation, service, submittedEntry)
      newerResult.resolve(newerEntry)
      await expect(newerRequest).resolves.toBe(newerEntry)
      olderResult.resolve(oldMutationEntry)

      await expect(olderRequest).resolves.toBe(oldMutationEntry)
      await expect(service.find(id)).resolves.toBe(newerEntry)
      expect(bibliographyRepository.find).not.toHaveBeenCalled()
    })

    test('newer mutation wins when the older mutation completes first', async () => {
      const olderResult = createDeferred<BibliographyEntry>()
      const newerResult = createDeferred<BibliographyEntry>()
      const newerEntry = new BibliographyEntry({ id, title: 'Newer result' })
      const service = new BibliographyService(bibliographyRepository)
      setMutationResult(mutation, bibliographyRepository, olderResult.promise)
      setMutationResult(mutation, bibliographyRepository, newerResult.promise)

      const olderRequest = mutate(mutation, service, submittedEntry)
      const newerRequest = mutate(mutation, service, submittedEntry)
      olderResult.resolve(oldMutationEntry)
      await expect(olderRequest).resolves.toBe(oldMutationEntry)
      newerResult.resolve(newerEntry)

      await expect(newerRequest).resolves.toBe(newerEntry)
      await expect(service.find(id)).resolves.toBe(newerEntry)
      expect(bibliographyRepository.find).not.toHaveBeenCalled()
    })
  },
)

test('create and update share latest mutation ordering', async () => {
  const bibliographyRepository = new (BibliographyRepository as jest.Mock<
    jest.Mocked<BibliographyRepository>
  >)()
  const id = 'canonical-entry-id'
  const submittedEntry = new BibliographyEntry({ id, title: 'Submitted' })
  const createEntry = new BibliographyEntry({ id, title: 'Create result' })
  const updateEntry = new BibliographyEntry({ id, title: 'Update result' })
  const createResult = createDeferred<BibliographyEntry>()
  const updateResult = createDeferred<BibliographyEntry>()
  const service = new BibliographyService(bibliographyRepository)
  setMutationResult('create', bibliographyRepository, createResult.promise)
  setMutationResult('update', bibliographyRepository, updateResult.promise)

  const createRequest = service.create(submittedEntry)
  const updateRequest = service.update(submittedEntry)
  createResult.resolve(createEntry)
  await expect(createRequest).resolves.toBe(createEntry)
  updateResult.resolve(updateEntry)

  await expect(updateRequest).resolves.toBe(updateEntry)
  await expect(service.find(id)).resolves.toBe(updateEntry)
  expect(bibliographyRepository.find).not.toHaveBeenCalled()
})

import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  createLoaderTestContext,
  defer,
  LoaderTestContext,
} from 'bibliography/application/BibliographyEntryLoader.testSupport'

jest.mock('bibliography/infrastructure/BibliographyRepository')

const id = 'entry-1'
let context: LoaderTestContext

beforeEach(() => {
  context = createLoaderTestContext([id])
})

test('Fetches an entry and answers it', async () => {
  context.repository.find.mockResolvedValue(context.entries[id])

  await expect(context.loader.find(id)).resolves.toBe(context.entries[id])
  expect(context.repository.find).toHaveBeenCalledWith(id)
})

test('Answers a cached entry without fetching again', async () => {
  context.repository.find.mockResolvedValue(context.entries[id])

  await context.loader.find(id)
  await expect(context.loader.find(id)).resolves.toBe(context.entries[id])

  expect(context.repository.find).toHaveBeenCalledTimes(1)
})

test('Reuses an in-flight request instead of fetching twice', async () => {
  const deferred = defer<BibliographyEntry>()
  context.repository.find.mockReturnValue(deferred.promise)

  const first = context.loader.find(id)
  const second = context.loader.find(id)
  deferred.resolve(context.entries[id])

  await expect(first).resolves.toBe(context.entries[id])
  await expect(second).resolves.toBe(context.entries[id])
  expect(context.repository.find).toHaveBeenCalledTimes(1)
})

test('Does not cache an entry whose request was cleared while in flight', async () => {
  const deferred = defer<BibliographyEntry>()
  context.repository.find.mockReturnValue(deferred.promise)

  const request = context.loader.find(id)
  context.loader.clear()
  deferred.resolve(context.entries[id])
  await expect(request).resolves.toBe(context.entries[id])

  context.repository.find.mockResolvedValue(context.entries[id])
  await context.loader.find(id)

  expect(context.repository.find).toHaveBeenCalledTimes(2)
})

test('Fetches again after the cache is cleared', async () => {
  context.repository.find.mockResolvedValue(context.entries[id])

  await context.loader.find(id)
  context.loader.clear()
  await context.loader.find(id)

  expect(context.repository.find).toHaveBeenCalledTimes(2)
})

test('An updated entry replaces the cached one', async () => {
  const updated = context.entries[id]
  context.repository.find.mockResolvedValue(updated)

  expect(context.loader.cacheUpdatedEntry(updated)).toBe(updated)
  await expect(context.loader.find(id)).resolves.toBe(updated)

  expect(context.repository.find).not.toHaveBeenCalled()
})

test('A failed request is not cached', async () => {
  const failure = new Error('not found')
  context.repository.find.mockRejectedValueOnce(failure)
  context.repository.find.mockResolvedValueOnce(context.entries[id])

  await expect(context.loader.find(id)).rejects.toBe(failure)
  await expect(context.loader.find(id)).resolves.toBe(context.entries[id])
})

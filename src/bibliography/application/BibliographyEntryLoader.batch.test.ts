import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  createLoaderTestContext,
  defer,
  LoaderTestContext,
} from 'bibliography/application/BibliographyEntryLoader.testSupport'

jest.mock('bibliography/infrastructure/BibliographyRepository')

const first = 'entry-1'
const second = 'entry-2'
let context: LoaderTestContext

beforeEach(() => {
  context = createLoaderTestContext([first, second])
})

function entriesOf(ids: string[]): BibliographyEntry[] {
  return ids.map((id) => context.entries[id])
}

test('Fetches the missing entries in one batch', async () => {
  context.repository.findMany.mockResolvedValue(entriesOf([first, second]))

  const entriesById = await context.loader.loadEntriesByIds([first, second])

  expect(context.repository.findMany).toHaveBeenCalledWith([first, second])
  expect(entriesById.get(first)).toBe(context.entries[first])
  expect(entriesById.get(second)).toBe(context.entries[second])
})

test('Answers cached entries without a batch request', async () => {
  context.repository.find.mockResolvedValue(context.entries[first])
  await context.loader.find(first)

  const entriesById = await context.loader.loadEntriesByIds([first])

  expect(context.repository.findMany).not.toHaveBeenCalled()
  expect(entriesById.get(first)).toBe(context.entries[first])
})

test('Joins an in-flight single request instead of batching it', async () => {
  const deferred = defer<BibliographyEntry>()
  context.repository.find.mockReturnValue(deferred.promise)

  const single = context.loader.find(first)
  const batch = context.loader.loadEntriesByIds([first])
  deferred.resolve(context.entries[first])

  await single
  expect((await batch).get(first)).toBe(context.entries[first])
  expect(context.repository.findMany).not.toHaveBeenCalled()
})

test('Reuses an in-flight batch for the same ids', async () => {
  const deferred = defer<readonly BibliographyEntry[]>()
  context.repository.findMany.mockReturnValue(deferred.promise)

  const firstBatch = context.loader.loadEntriesByIds([first, second])
  const secondBatch = context.loader.loadEntriesByIds([second, first])
  deferred.resolve(entriesOf([first, second]))

  await firstBatch
  await secondBatch

  expect(context.repository.findMany).toHaveBeenCalledTimes(1)
})

test('Falls back to a single request for an id the batch omitted', async () => {
  context.repository.findMany.mockResolvedValue(entriesOf([first]))
  context.repository.find.mockResolvedValue(context.entries[second])

  const entriesById = await context.loader.loadEntriesByIds([first, second])

  expect(context.repository.find).toHaveBeenCalledWith(second)
  expect(entriesById.get(second)).toBe(context.entries[second])
})

test('An id already in flight is not tracked again by a batch', async () => {
  const deferred = defer<BibliographyEntry>()
  context.repository.find.mockReturnValue(deferred.promise)
  context.repository.findMany.mockResolvedValue(entriesOf([second]))

  const single = context.loader.find(first)
  const batch = context.loader.loadEntriesByIds([first, second])
  deferred.resolve(context.entries[first])

  await single
  const entriesById = await batch

  expect(context.repository.findMany).toHaveBeenCalledWith([second])
  expect(entriesById.get(first)).toBe(context.entries[first])
  expect(entriesById.get(second)).toBe(context.entries[second])
})

test('A batch that settles after a clear still caches its entries', async () => {
  const deferred = defer<readonly BibliographyEntry[]>()
  context.repository.findMany.mockReturnValue(deferred.promise)

  const batch = context.loader.loadEntriesByIds([first])
  context.loader.clear()
  deferred.resolve(entriesOf([first]))
  await batch

  const entriesById = await context.loader.loadEntriesByIds([first])

  expect(entriesById.get(first)).toBe(context.entries[first])
  expect(context.repository.findMany).toHaveBeenCalledTimes(1)
})

test('An updated entry is served from the cache', async () => {
  context.repository.findMany.mockResolvedValue(entriesOf([first]))
  await context.loader.loadEntriesByIds([first])

  context.loader.cacheUpdatedEntry(context.entries[first])
  const entriesById = await context.loader.loadEntriesByIds([first])

  expect(entriesById.get(first)).toBe(context.entries[first])
  expect(context.repository.findMany).toHaveBeenCalledTimes(1)
})

import { createLoaderTestContext } from 'bibliography/application/BibliographyEntryLoader.testSupport'
import { ApiError } from 'http/ApiClient'

jest.mock('bibliography/infrastructure/BibliographyRepository')

test('rejects pre-aborted individual and batch lookups without requests', async () => {
  const { loader, repository } = createLoaderTestContext(['Q1'])
  const controller = new AbortController()
  controller.abort()

  await expect(loader.find('Q1', controller.signal)).rejects.toHaveProperty(
    'name',
    'AbortError',
  )
  await expect(
    loader.loadEntriesByIds(['Q1'], controller.signal),
  ).rejects.toHaveProperty('name', 'AbortError')
  expect(repository.find).not.toHaveBeenCalled()
  expect(repository.findMany).not.toHaveBeenCalled()
})

test('forwards cancellation to individual and fallback requests', async () => {
  const { loader, repository, entries } = createLoaderTestContext(['Q1'])
  const controller = new AbortController()
  repository.find.mockResolvedValue(entries.Q1)
  repository.findMany.mockResolvedValue([])

  await expect(loader.find('Q1', controller.signal)).resolves.toBe(entries.Q1)
  await expect(
    loader.loadEntriesByIds(['Q1'], controller.signal),
  ).resolves.toEqual(new Map([['Q1', entries.Q1]]))

  expect(repository.find).toHaveBeenCalledWith('Q1', controller.signal)
  expect(repository.findMany).toHaveBeenCalledWith(['Q1'], controller.signal)
})

test('retains independent missing-entry isolation with an abort signal', async () => {
  const { loader, repository, entries } = createLoaderTestContext(['Q1'])
  repository.findMany.mockResolvedValue([entries.Q1])
  repository.find.mockRejectedValue(new ApiError('Missing', {}, 404))

  await expect(
    loader.findManyById(['Q1', 'missing'], new AbortController().signal),
  ).resolves.toEqual(new Map([['Q1', entries.Q1]]))
})

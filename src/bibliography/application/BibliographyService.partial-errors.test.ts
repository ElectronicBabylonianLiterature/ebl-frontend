import BibliographyService from 'bibliography/application/BibliographyService'
import {
  createBibliographyRepositoryMock,
  createDeferred,
} from 'bibliography/application/BibliographyService.testSupport'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { ApiError } from 'http/ApiClient'

test.each([
  new ApiError('Server unavailable', {}, 500),
  new Error('Network unavailable'),
])(
  'preserves successful siblings while reporting an individual %s',
  async (error) => {
    const repository = createBibliographyRepositoryMock()
    const entry = new BibliographyEntry({ id: 'healthy' })
    const service = new BibliographyService(repository)
    const reportError = jest.fn()
    repository.findMany.mockResolvedValue([entry])
    repository.find.mockRejectedValue(error)

    await expect(
      service.findManyById(['failed', entry.id, 'failed'], reportError),
    ).resolves.toEqual(new Map([[entry.id, entry]]))

    expect(reportError).toHaveBeenCalledTimes(1)
    expect(reportError).toHaveBeenCalledWith(error)
    expect(repository.findMany).toHaveBeenCalledTimes(1)
    expect(repository.find).toHaveBeenCalledTimes(1)
    await expect(service.find(entry.id)).resolves.toBe(entry)
  },
)

test('preserves a later successful alias and does not report an expected missing entry', async () => {
  const repository = createBibliographyRepositoryMock()
  const service = new BibliographyService(repository)
  const aliasResult = createDeferred<BibliographyEntry>()
  const aliasStarted = createDeferred<void>()
  const reportError = jest.fn()
  const failure = new ApiError('Server unavailable', {}, 500)
  const entry = new BibliographyEntry({ id: 'canonical' })
  repository.findMany.mockResolvedValue([])
  repository.find.mockImplementation((id) => {
    if (id === 'alias') {
      aliasStarted.resolve()
      return aliasResult.promise
    }
    return Promise.reject(
      id === 'missing' ? new ApiError('Not Found', {}, 404) : failure,
    )
  })

  const request = service.findManyById(
    ['failed', 'missing', 'alias'],
    reportError,
  )
  await aliasStarted.promise
  aliasResult.resolve(entry)

  await expect(request).resolves.toEqual(new Map([['alias', entry]]))
  await expect(service.find('alias')).resolves.toBe(entry)
  await expect(service.find(entry.id)).resolves.toBe(entry)
  expect(reportError).toHaveBeenCalledTimes(1)
  expect(reportError).toHaveBeenCalledWith(failure)
  expect(repository.find).toHaveBeenCalledTimes(3)
})

test.each(['direct', 'batch'])(
  'isolates a shared %s failure for a graceful reader',
  async (reader) => {
    const repository = createBibliographyRepositoryMock()
    const service = new BibliographyService(repository)
    const result = createDeferred<BibliographyEntry>()
    const started = createDeferred<void>()
    const entry = new BibliographyEntry({ id: 'healthy' })
    const failure = new ApiError('Server unavailable', {}, 500)
    const reportError = jest.fn()
    repository.findMany.mockImplementation((ids) =>
      Promise.resolve(ids.includes(entry.id) ? [entry] : []),
    )
    repository.find.mockImplementation(() => {
      started.resolve()
      return result.promise.then(() => {
        throw failure
      })
    })

    const strictRequest =
      reader === 'direct'
        ? service.find('failed')
        : service.findManyById(['failed'])
    const rejection = expect(strictRequest).rejects.toBe(failure)
    await started.promise
    const gracefulRequest = service.findManyById(
      ['failed', entry.id],
      reportError,
    )
    result.resolve(entry)

    await rejection
    await expect(gracefulRequest).resolves.toEqual(new Map([[entry.id, entry]]))
    expect(reportError).toHaveBeenCalledTimes(1)
    expect(reportError).toHaveBeenCalledWith(failure)
    expect(repository.find).toHaveBeenCalledTimes(1)
  },
)

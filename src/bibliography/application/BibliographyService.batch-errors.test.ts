import Bluebird from 'bluebird'
import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import { ApiError } from 'http/ApiClient'

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

const systemicErrors: ReadonlyArray<[string, () => Error]> = [
  ['network', () => new Error('Network unavailable')],
  ['authentication', () => new ApiError('Unauthorized', {}, 401)],
  ['authorization', () => new ApiError('Forbidden', {}, 403)],
  ['server', () => new ApiError('Server error', {}, 500)],
  ['malformed response', () => new SyntaxError('Invalid JSON')],
]

describe('BibliographyService batch errors', () => {
  const bibliographyRepository = new (BibliographyRepository as jest.Mock<
    jest.Mocked<BibliographyRepository>
  >)()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each(systemicErrors)(
    'propagates a %s error from an individual fallback',
    async (_, createError) => {
      const error = createError()
      const service = new BibliographyService(bibliographyRepository)
      bibliographyRepository.findMany.mockResolvedValue([])
      bibliographyRepository.find.mockRejectedValue(error)

      await expect(service.findMany(['RN1'])).rejects.toBe(error)
      expect(bibliographyRepository.find).toHaveBeenCalledTimes(1)
    },
  )

  test.each([
    ['not found', () => new ApiError('Not Found', {}, 404)],
    ...systemicErrors,
  ])('propagates a %s error from the batch request', async (_, createError) => {
    const error = createError()
    const service = new BibliographyService(bibliographyRepository)
    bibliographyRepository.findMany.mockRejectedValue(error)

    await expect(service.findMany(['RN1'])).rejects.toBe(error)
    expect(bibliographyRepository.find).not.toHaveBeenCalled()
  })

  test('propagates a shared in-flight batch 404 to every findMany caller', async () => {
    const error = new ApiError('Not Found', {}, 404)
    let rejectBatch: ((error: Error) => void) | undefined
    bibliographyRepository.findMany.mockReturnValue(
      new Bluebird((_, reject) => {
        rejectBatch = (reason) => reject(reason)
      }),
    )
    const service = new BibliographyService(bibliographyRepository)

    const firstRequest = service.findMany(['RN1'])
    const secondRequest = service.findMany(['RN1'])
    const firstExpectation = expect(firstRequest).rejects.toBe(error)
    const secondExpectation = expect(secondRequest).rejects.toBe(error)
    rejectBatch?.(error)

    await firstExpectation
    await secondExpectation
    expect(bibliographyRepository.findMany).toHaveBeenCalledTimes(1)
    expect(bibliographyRepository.find).not.toHaveBeenCalled()
  })
})

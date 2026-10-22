import { ApiError } from 'http/ApiClient'
import {
  fragmentRepository,
  fragmentService,
} from 'fragmentarium/application/fragmentService.testSupport'

beforeEach(() => jest.resetAllMocks())

test('resolves false for an asynchronous missing fragment', async () => {
  fragmentRepository.find.mockRejectedValue(new ApiError('Not found', {}, 404))

  await expect(fragmentService.isInFragmentarium('K.404')).resolves.toBe(false)
  expect(fragmentRepository.find).toHaveBeenCalledWith('K.404')
})

test.each([
  new ApiError('Unauthorized', {}, 401),
  new ApiError('Forbidden', {}, 403),
  new ApiError('Unavailable', {}, 503),
  new ApiError('Unknown status', {}),
  new Error('Network failure'),
])('propagates operational failure %s', async (error) => {
  fragmentRepository.find.mockRejectedValue(error)

  await expect(fragmentService.isInFragmentarium('K.1')).rejects.toBe(error)
})

test('propagates a synchronous operational failure', async () => {
  const error = new Error('Failed to start request')
  fragmentRepository.find.mockImplementation(() => {
    throw error
  })

  await expect(fragmentService.isInFragmentarium('K.1')).rejects.toBe(error)
})

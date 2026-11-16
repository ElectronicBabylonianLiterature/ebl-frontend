import {
  createFragmentService,
  fragmentRepository,
} from 'fragmentarium/application/fragmentService.testSupport'

beforeEach(() => jest.clearAllMocks())

test('media changes invalidate cached fragment search results through the service', async () => {
  const service = createFragmentService()
  fragmentRepository.query.mockResolvedValue({
    items: [{ museumNumber: 'K.1', matchingLines: [], matchCount: 0 }],
    matchCountTotal: 1,
  })
  await service.query({ number: 'K.1' })
  await service.query({ number: 'K.1' })
  expect(fragmentRepository.query).toHaveBeenCalledTimes(1)
  service.invalidateMedia('K.1')
  fragmentRepository.query.mockResolvedValue({ items: [], matchCountTotal: 0 })
  await service.query({ number: 'K.1' })
  expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
})

import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  bibliographyService,
  buildTestFragment,
  createFragmentService,
  fragmentRepository,
  fragmentService,
  number,
  stubMissingBibliography,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'

let fragment: Fragment
let result: Fragment

beforeEach(() => {
  jest.clearAllMocks()
  fragment = buildTestFragment()
  stubMissingBibliography()
})

describe('find', () => {
  beforeEach(async () => {
    const service = createFragmentService()
    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
    result = await service.find(number)
  })

  test('Returns fragment', () => expect(result).toEqual(fragment))
  test('Finds correct fragment', () => {
    expect(fragmentRepository.find).toHaveBeenCalledWith(
      number,
      undefined,
      undefined,
    )
  })
})
describe('bibliography errors', () => {
  test('propagates a systemic lookup failure unchanged', async () => {
    const error = new Error('Bibliography unavailable')
    const service = createFragmentService()
    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
    bibliographyService.findManyById.mockRejectedValue(error)

    await expect(service.find(number)).rejects.toBe(error)
  })
})

describe('Reject with permission denied', () => {
  test('Throws permission error', async () => {
    fragmentRepository.find.mockReturnValueOnce(
      Promise.reject(new Error('403 Forbidden')),
    )
    await expect(fragmentService.find('X.1')).rejects.toThrowError(
      "You don't have permissions to view this fragment.",
    )
  })
})

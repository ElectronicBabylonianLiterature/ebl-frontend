import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  buildTestFragment,
  createFragmentService,
  fragmentRepository,
  number,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'

const concurrencyLimit = 6

let service: FragmentService
let fragment: Fragment
let resolveRequests: ((value: Fragment) => void)[]

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

const repositorySignal = (call = 0): AbortSignal =>
  fragmentRepository.find.mock.calls[call][3]

async function occupyAllSlots(
  signal?: AbortSignal,
): Promise<Promise<Fragment>[]> {
  const requests = Array.from({ length: concurrencyLimit }, (_unused, index) =>
    service.find(`X.${index}`, undefined, undefined, signal),
  )
  await flushPromises()
  expect(fragmentRepository.find).toHaveBeenCalledTimes(concurrencyLimit)
  return requests
}

beforeEach(() => {
  fragmentRepository.find.mockReset()
  resolveRequests = []
  fragment = buildTestFragment()
  service = createFragmentService()
  fragmentRepository.find.mockImplementation(
    (_number, _lines, _excludeLines, signal?: AbortSignal) =>
      new Promise<Fragment>((resolve, reject) => {
        resolveRequests.push(resolve)
        signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      }),
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})

export {
  service,
  fragment,
  resolveRequests,
  flushPromises,
  repositorySignal,
  occupyAllSlots,
  concurrencyLimit,
  fragmentRepository,
  number,
}

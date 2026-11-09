import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  buildTestFragment,
  createFragmentService,
  fragmentRepository,
  number,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'

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

it('aborts the repository request and frees its limiter slot', async () => {
  const controller = new AbortController()
  const requests = await occupyAllSlots(controller.signal)
  const queued = service.find('X.queued')
  await flushPromises()
  expect(fragmentRepository.find).toHaveBeenCalledTimes(concurrencyLimit)

  controller.abort()

  await Promise.all(
    requests.map((request) =>
      expect(request).rejects.toMatchObject({ name: 'AbortError' }),
    ),
  )
  await flushPromises()
  expect(fragmentRepository.find).toHaveBeenCalledTimes(concurrencyLimit + 1)
  expect(repositorySignal().aborted).toBe(true)
  resolveRequests[concurrencyLimit](fragment)
  await expect(queued).resolves.toBeDefined()
})

it('frees the limiter slot while references are still being injected', async () => {
  jest
    .spyOn(ReferenceInjector.prototype, 'injectReferencesToText')
    .mockReturnValue(new Promise(() => undefined))
  const controller = new AbortController()
  fragmentRepository.find.mockResolvedValueOnce(fragment)
  const injecting = service.find(
    number,
    undefined,
    undefined,
    controller.signal,
  )
  await flushPromises()
  Array.from({ length: concurrencyLimit - 1 }, (_unused, index) =>
    service.find(`X.${index}`),
  )
  service.find('X.queued')
  await flushPromises()
  expect(fragmentRepository.find).toHaveBeenCalledTimes(concurrencyLimit)

  controller.abort()

  await expect(injecting).rejects.toMatchObject({ name: 'AbortError' })
  await flushPromises()
  expect(fragmentRepository.find).toHaveBeenCalledTimes(concurrencyLimit + 1)
})

it('never starts a queued request that is aborted', async () => {
  await occupyAllSlots()
  const controller = new AbortController()
  const queued = service.find(
    'X.queued',
    undefined,
    undefined,
    controller.signal,
  )
  await flushPromises()

  controller.abort()

  await expect(queued).rejects.toMatchObject({ name: 'AbortError' })
  resolveRequests[0](fragment)
  await flushPromises()
  expect(fragmentRepository.find).toHaveBeenCalledTimes(concurrencyLimit)
})

it('rejects immediately without fetching when already aborted', async () => {
  const controller = new AbortController()
  controller.abort()

  await expect(
    service.find(number, undefined, undefined, controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(fragmentRepository.find).not.toHaveBeenCalled()
})

describe('callers sharing one in-flight request', () => {
  it('keeps the request running until every signal has aborted', async () => {
    const first = new AbortController()
    const second = new AbortController()
    const firstRequest = service.find(
      number,
      undefined,
      undefined,
      first.signal,
    )
    const secondRequest = service.find(
      number,
      undefined,
      undefined,
      second.signal,
    )
    await flushPromises()
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)

    first.abort()

    await expect(firstRequest).rejects.toMatchObject({ name: 'AbortError' })
    expect(repositorySignal().aborted).toBe(false)
    resolveRequests[0](fragment)
    await expect(secondRequest).resolves.toEqual(fragment)
  })

  it('aborts the request once the last signal has aborted', async () => {
    const first = new AbortController()
    const second = new AbortController()
    const requests = [first, second].map((controller) =>
      service.find(number, undefined, undefined, controller.signal),
    )
    await flushPromises()

    first.abort()
    second.abort()

    await Promise.all(
      requests.map((request) =>
        expect(request).rejects.toMatchObject({ name: 'AbortError' }),
      ),
    )
    expect(repositorySignal().aborted).toBe(true)
  })

  it('does not abort a request that a signal-less caller also needs', async () => {
    const controller = new AbortController()
    const abortable = service.find(
      number,
      undefined,
      undefined,
      controller.signal,
    )
    const uncancellable = service.find(number)
    await flushPromises()

    controller.abort()

    await expect(abortable).rejects.toMatchObject({ name: 'AbortError' })
    expect(repositorySignal().aborted).toBe(false)
    resolveRequests[0](fragment)
    await expect(uncancellable).resolves.toEqual(fragment)
  })

  it('rejects only the aborting caller of a signal-less request', async () => {
    const uncancellable = service.find(number)
    const controller = new AbortController()
    const abortable = service.find(
      number,
      undefined,
      undefined,
      controller.signal,
    )
    await flushPromises()

    controller.abort()

    await expect(abortable).rejects.toMatchObject({ name: 'AbortError' })
    resolveRequests[0](fragment)
    await expect(uncancellable).resolves.toEqual(fragment)
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })
})

describe('after an abort', () => {
  it('does not cache the aborted request', async () => {
    const controller = new AbortController()
    const aborted = service.find(
      number,
      undefined,
      undefined,
      controller.signal,
    )
    await flushPromises()
    controller.abort()
    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' })
    await flushPromises()

    const retried = service.find(number)
    await flushPromises()
    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
    resolveRequests[1](fragment)
    await expect(retried).resolves.toEqual(fragment)
  })

  it('gives a caller arriving right after the abort a fresh request', async () => {
    const controller = new AbortController()
    const aborted = service.find(
      number,
      undefined,
      undefined,
      controller.signal,
    )
    await flushPromises()

    controller.abort()
    const retried = service.find(number)

    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' })
    await flushPromises()
    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
    resolveRequests[1](fragment)
    await expect(retried).resolves.toEqual(fragment)
  })

  it('caches a completed abortable request for later callers', async () => {
    const request = service.find(
      number,
      undefined,
      undefined,
      new AbortController().signal,
    )
    await flushPromises()
    resolveRequests[0](fragment)
    await request

    await expect(service.find(number)).resolves.toEqual(fragment)
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })
})

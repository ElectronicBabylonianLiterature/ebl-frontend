import {
  service,
  fragment,
  resolveRequests,
  flushPromises,
  repositorySignal,
  fragmentRepository,
  number,
} from './fragmentServiceAbort.testSupport'

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

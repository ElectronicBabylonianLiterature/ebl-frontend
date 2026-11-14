import {
  service,
  fragment,
  resolveRequests,
  flushPromises,
  repositorySignal,
  occupyAllSlots,
  concurrencyLimit,
  fragmentRepository,
  number,
} from './fragmentServiceAbort.testSupport'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'

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

import SharedAbortableRequests from './SharedAbortableRequests'

test('settling an abandoned request does not detach a newer request with the same key', async () => {
  const shared = new SharedAbortableRequests<string>()
  const first = new AbortController()
  const second = new AbortController()
  const third = new AbortController()
  let finishFirst: (value: string) => void = () => undefined
  let secondSignal: AbortSignal | undefined
  const firstRequest = shared.run(
    'fragment',
    first.signal,
    (start) => start(),
    () =>
      new Promise((resolve) => {
        finishFirst = resolve
      }),
  )
  const secondRequest = shared.run(
    'fragment',
    second.signal,
    (start) => start(),
    (signal) => {
      secondSignal = signal
      return new Promise((_resolve, reject) =>
        signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        ),
      )
    },
  )
  first.abort()
  await expect(firstRequest).rejects.toMatchObject({ name: 'AbortError' })
  finishFirst('old response')
  await Promise.resolve()
  const thirdRequest = shared.run(
    'fragment',
    third.signal,
    () => secondRequest,
    jest.fn(),
  )
  second.abort()
  await expect(secondRequest).rejects.toMatchObject({ name: 'AbortError' })
  expect(secondSignal?.aborted).toBe(false)
  third.abort()
  await expect(thirdRequest).rejects.toMatchObject({ name: 'AbortError' })
  expect(secondSignal?.aborted).toBe(true)
})

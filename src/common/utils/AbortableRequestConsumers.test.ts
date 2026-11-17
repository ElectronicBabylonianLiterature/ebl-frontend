import AbortableRequestConsumers from 'common/utils/AbortableRequestConsumers'

test('an already-aborted consumer cannot join or abandon an active request', async () => {
  const consumers = new AbortableRequestConsumers()
  const controller = new AbortController()
  const abandon = jest.fn()
  controller.abort()

  await expect(
    consumers.subscribe(Promise.resolve('value'), controller.signal, abandon),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(abandon).not.toHaveBeenCalled()
})

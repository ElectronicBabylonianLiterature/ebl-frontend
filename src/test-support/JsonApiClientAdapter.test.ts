import FakeApi from 'test-support/FakeApi'
import JsonApiClientAdapter from 'test-support/JsonApiClientAdapter'

const path = '/resource'

function adapt(): { fakeApi: FakeApi; adapter: JsonApiClientAdapter } {
  const fakeApi = new FakeApi()
  return { fakeApi, adapter: new JsonApiClientAdapter(fakeApi.client) }
}

test('delegates fetchJson with the same arguments', async () => {
  const { fakeApi, adapter } = adapt()
  fakeApi.client.fetchJson.mockResolvedValue({ id: 1 })
  const signal = new AbortController().signal
  await expect(adapter.fetchJson(path, false, signal)).resolves.toEqual({
    id: 1,
  })
  await adapter.fetchJson(path, true)
  expect(fakeApi.client.fetchJson.mock.calls).toEqual([
    [path, false, signal],
    [path, true],
  ])
})

test('delegates fetchBlob with the same arguments', async () => {
  const { fakeApi, adapter } = adapt()
  const blob = new Blob(['data'])
  fakeApi.client.fetchBlob.mockResolvedValue(blob)
  await expect(adapter.fetchBlob(path, true)).resolves.toBe(blob)
  expect(fakeApi.client.fetchBlob).toHaveBeenCalledWith(path, true)
})

test('delegates postJson with object bodies', async () => {
  const { fakeApi, adapter } = adapt()
  fakeApi.client.postJson.mockResolvedValue('posted')
  await expect(adapter.postJson(path, { a: 1 }, false)).resolves.toEqual(
    'posted',
  )
  expect(fakeApi.client.postJson).toHaveBeenCalledWith(path, { a: 1 }, false)
})

test('rejects postJson with a non-object body', async () => {
  const { fakeApi, adapter } = adapt()
  await expect(adapter.postJson(path, 'text')).rejects.toThrow(
    `Unsupported postJson body for ${path}`,
  )
  expect(fakeApi.client.postJson).not.toHaveBeenCalled()
})

test('rejects putJson', async () => {
  const { adapter } = adapt()
  await expect(adapter.putJson(path)).rejects.toThrow(
    `Unexpected putJson: ${path}`,
  )
})

test('creates anonymous headers without authentication', async () => {
  const { adapter } = adapt()
  const headers = await adapter.createHeaders(false, { Accept: 'x' }, path)
  expect(headers.get('Authorization')).toBeNull()
  expect(headers.get('Accept')).toEqual('x')
})

test('cannot authenticate', async () => {
  const { adapter } = adapt()
  await expect(adapter.createHeaders(true, {}, path)).rejects.toThrow(
    'JsonApiClientAdapter does not authenticate',
  )
})

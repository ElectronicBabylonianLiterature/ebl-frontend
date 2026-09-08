import FakeApiBase from 'test-support/FakeApiBase'

class TestApi extends FakeApiBase {
  allowImage(path: string): this {
    return this.allowGet(path, 'image-bytes', true)
  }
}

let testApi: TestApi

beforeEach(() => {
  testApi = new TestApi()
})

test('A stubbed blob request resolves with the stubbed response', async () => {
  testApi.allowImage('/images/known')

  await expect(
    testApi.client.fetchBlob('/images/known', true),
  ).resolves.toEqual('image-bytes')
})

test('An unstubbed authenticated blob request rejects', async () => {
  await expect(
    testApi.client.fetchBlob('/images/unknown', true),
  ).rejects.toThrow('Unexpected authenticated fetchBlob: /images/unknown')
})

test('An unstubbed unauthenticated JSON request rejects', async () => {
  await expect(testApi.client.fetchJson('/unknown', false)).rejects.toThrow(
    'Unexpected not-authenticated fetchJson: /unknown',
  )
})

test('An unstubbed POST rejects', async () => {
  await expect(testApi.client.postJson('/unknown', {})).rejects.toThrow(
    'Unexpected postJson: /unknown',
  )
})

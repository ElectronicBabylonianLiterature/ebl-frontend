import SignService from 'signs/application/SignService'
import SignRepository from 'signs/infrastructure/SignRepository'
import { createApiClientTestContext } from 'http/ApiClient.testSupport'

it('hands the conversion signal to the real fetch request', async () => {
  const { apiClient } = createApiClientTestContext()
  const signService = new SignService(new SignRepository(apiClient))
  const response = [{ unicode: [73979] }]
  fetchMock.mockResponse(JSON.stringify(response))
  const controller = new AbortController()

  await expect(
    signService.getUnicodeFromAtf('ša₂', controller.signal),
  ).resolves.toEqual(response)

  const [url, requestInit] = fetchMock.mock.calls[0]
  expect(url).toMatch(
    new RegExp(`/signs/transliteration/${encodeURIComponent('ša₂')}$`),
  )
  expect((requestInit as RequestInit).signal).toBe(controller.signal)
})

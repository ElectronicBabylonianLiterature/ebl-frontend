import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import { createApiClientTestContext } from 'http/ApiClient.testSupport'

const canonicalId = 'Q123'
const alias = 'RN1971axx'

test('a backend 204 update refreshes canonical and previously cached alias lookups', async () => {
  const { apiClient, errorReporter } = createApiClientTestContext()
  const service = new BibliographyService(new BibliographyRepository(apiClient))
  const stale = { id: canonicalId, title: 'Before edit' }
  const submitted = new BibliographyEntry({
    id: canonicalId,
    title: 'After edit',
  })
  fetchMock
    .mockResponseOnce(JSON.stringify(stale))
    .mockResponseOnce('', { status: 204 })
    .mockResponseOnce(JSON.stringify(submitted.toCslData()))

  expect((await service.find(alias)).title).toBe('Before edit')
  await expect(service.update(submitted)).resolves.toBe(submitted)
  await expect(service.find(canonicalId)).resolves.toBe(submitted)
  expect((await service.find(alias)).title).toBe('After edit')

  expect(fetchMock).toHaveBeenCalledTimes(3)
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining(`/bibliography/${canonicalId}`),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(submitted.toCslData()),
    }),
  )
  expect(errorReporter.captureException).not.toHaveBeenCalled()
})

test('an update response with content retains the server entry', async () => {
  const { apiClient } = createApiClientTestContext()
  const service = new BibliographyService(new BibliographyRepository(apiClient))
  const submitted = new BibliographyEntry({ id: canonicalId, title: 'Input' })
  fetchMock.mockResponseOnce(
    JSON.stringify({ id: canonicalId, title: 'Normalized response' }),
  )

  const result = await service.update(submitted)

  expect(result.id).toBe(canonicalId)
  expect(result.title).toBe('Normalized response')
  await expect(service.find(canonicalId)).resolves.toBe(result)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

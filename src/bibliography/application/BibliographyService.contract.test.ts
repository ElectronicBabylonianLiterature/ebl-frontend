import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import ApiClient from 'http/ApiClient'

jest.mock('http/ApiClient')

test('keys canonical-only backend list results by each requested alias', async () => {
  const api = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
  const canonical = { id: 'Q123', title: 'Canonical bibliography record' }
  api.fetchJson.mockImplementation((path) =>
    Promise.resolve(
      path.startsWith('/bibliography/list?') ? [canonical] : canonical,
    ),
  )
  const service = new BibliographyService(new BibliographyRepository(api))

  const entries = await service.findManyById(['RN1971axx', 'Q123'])

  expect([...entries.keys()].sort()).toEqual(['Q123', 'RN1971axx'])
  expect(entries.get('Q123')?.id).toBe('Q123')
  expect(entries.get('RN1971axx')?.id).toBe('Q123')
  expect(api.fetchJson).toHaveBeenCalledTimes(2)
  expect(api.fetchJson).toHaveBeenCalledWith(
    '/bibliography/RN1971axx',
    false,
    undefined,
  )
})

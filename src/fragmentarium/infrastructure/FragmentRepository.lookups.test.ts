import { stringify } from 'querystring'
import { createFragmentRepositoryTestContext } from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

test('fetchGenres', async () => {
  const genres = [['ARCHIVAL'], ['CANONICAL']]
  apiClient.fetchJson.mockResolvedValueOnce(genres)

  await expect(fragmentRepository.fetchGenres()).resolves.toEqual(genres)
  expect(apiClient.fetchJson).toHaveBeenCalledWith('/genres', false, undefined)
})

test('fetchGenres forwards an abort signal', async () => {
  const { signal } = new AbortController()
  apiClient.fetchJson.mockResolvedValueOnce([])

  await fragmentRepository.fetchGenres(signal)

  expect(apiClient.fetchJson).toHaveBeenCalledWith('/genres', false, signal)
})

test('fetchPeriods', async () => {
  const periods = ['Ur III', 'Old Babylonian']
  apiClient.fetchJson.mockResolvedValueOnce(periods)

  await expect(fragmentRepository.fetchPeriods()).resolves.toEqual(periods)
  expect(apiClient.fetchJson).toHaveBeenCalledWith('/periods', false, undefined)
})

test('fetchColophonNames', async () => {
  const query = 'Nabu ša'
  const names = ['Nabu-šuma-iddina']
  apiClient.fetchJson.mockResolvedValueOnce(names)

  await expect(fragmentRepository.fetchColophonNames(query)).resolves.toEqual(
    names,
  )
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `/fragments/colophon-names?${stringify({ query })}`,
    false,
  )
})

test('fetchNamedEntityAnnotations', async () => {
  const number = 'K.1'
  const spans = [{ id: 'span-1' }]
  apiClient.fetchJson.mockResolvedValueOnce(spans)

  await expect(
    fragmentRepository.fetchNamedEntityAnnotations(number),
  ).resolves.toEqual(spans)
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `/fragments/${encodeURIComponent(number)}/named-entities`,
    false,
    undefined,
  )
})

test('fetchNamedEntityAnnotations forwards an abort signal', async () => {
  const { signal } = new AbortController()
  apiClient.fetchJson.mockResolvedValueOnce([])

  await fragmentRepository.fetchNamedEntityAnnotations('K.1', signal)

  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/fragments/K.1/named-entities',
    false,
    signal,
  )
})

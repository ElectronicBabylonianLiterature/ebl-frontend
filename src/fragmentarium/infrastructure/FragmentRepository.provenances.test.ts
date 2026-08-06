import { createFragmentRepositoryTestContext } from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

describe('FragmentRepository provenances', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('fetches provenance list', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])

    await expect(fragmentRepository.fetchProvenances()).resolves.toEqual([])
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/provenances', false)
  })

  test('fetches provenance by id', async () => {
    const record = {
      id: 'uruk',
      longName: 'Uruk',
      abbreviation: 'Urk',
      parent: 'Babylonia',
      sortKey: 10,
      polygonCoordinates: [
        { latitude: 31.3, longitude: 45.6 },
        { latitude: 31.35, longitude: 45.63 },
        { latitude: 31.32, longitude: 45.67 },
      ],
    }
    apiClient.fetchJson.mockResolvedValueOnce(record)

    await expect(fragmentRepository.fetchProvenance('uruk')).resolves.toEqual(
      record,
    )
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/provenances/uruk', false)
  })

  test('fetches provenance children by id', async () => {
    const records = [
      {
        id: 'babylon',
        longName: 'Babylon',
        abbreviation: 'Bab',
        parent: 'Babylonia',
        sortKey: 10,
        coordinates: {
          latitude: 32.54,
          longitude: 44.42,
        },
      },
    ]
    apiClient.fetchJson.mockResolvedValueOnce(records)

    await expect(
      fragmentRepository.fetchProvenanceChildren('babylonia'),
    ).resolves.toEqual(records)
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/provenances/babylonia/children',
      false,
    )
  })
})

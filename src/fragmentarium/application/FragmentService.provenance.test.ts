import Promise from 'bluebird'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  childrenOptions,
  createFragmentService,
  fragmentRepository,
  fragmentService,
  provenanceOptions,
  stubMissingBibliography,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'

let provenanceResult: readonly ProvenanceRecord[]

beforeEach(() => {
  jest.clearAllMocks()
  stubMissingBibliography()
})

describe('fetch provenances', () => {
  beforeEach(async () => {
    fragmentRepository.fetchProvenances.mockReturnValue(
      Promise.resolve(provenanceOptions),
    )
    provenanceResult = await fragmentService.fetchProvenances()
  })

  test('returns provenances in API order', () =>
    expect(provenanceResult.map((provenance) => provenance.id)).toEqual([
      'babylon',
      'assur',
      'sippar',
    ]))

  test('keeps records with valid coordinates and polygons', () => {
    expect(provenanceResult[0].coordinates).toEqual(
      expect.objectContaining({ latitude: 32.542, longitude: 44.42 }),
    )
    expect(provenanceResult[0].polygonCoordinates).toHaveLength(3)
    expect(provenanceResult[1].coordinates).toBeUndefined()
    expect(provenanceResult[1].polygonCoordinates).toBeUndefined()
    expect(provenanceResult[2].coordinates).toBeUndefined()
    expect(provenanceResult[2].polygonCoordinates).toEqual([
      { latitude: 33.1, longitude: 44.2 },
      { latitude: 33.2, longitude: 44.4 },
      { latitude: 33.3, longitude: 44.35 },
    ])
  })

  test('uses cached provenance list', async () => {
    const service = createFragmentService()
    await service.fetchProvenances()
    await service.fetchProvenances()
    expect(fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(1)
  })
})

describe('fetch provenance by id', () => {
  const provenenceById: ProvenanceRecord = {
    id: 'uruk',
    longName: 'Uruk',
    abbreviation: 'Urk',
    parent: 'Babylonia',
    sortKey: 30,
  }

  beforeEach(() => {
    fragmentRepository.fetchProvenance.mockReturnValue(
      Promise.resolve(provenenceById),
    )
  })

  test('returns provenance by id', async () => {
    await expect(fragmentService.fetchProvenance('uruk')).resolves.toEqual(
      provenenceById,
    )
    expect(fragmentRepository.fetchProvenance).toHaveBeenCalledWith('uruk')
  })

  test('uses cached provenance by id', async () => {
    const service = createFragmentService()
    await service.fetchProvenance('uruk')
    await service.fetchProvenance('uruk')
    expect(fragmentRepository.fetchProvenance).toHaveBeenCalledTimes(1)
  })
})

describe('fetch provenance children', () => {
  beforeEach(() => {
    fragmentRepository.fetchProvenanceChildren.mockReturnValue(
      Promise.resolve(childrenOptions),
    )
  })

  test('returns children for parent id in API order', async () => {
    await expect(
      fragmentService.fetchProvenanceChildren('babylonia'),
    ).resolves.toEqual([
      expect.objectContaining({ id: 'nippur' }),
      expect.objectContaining({ id: 'babylon' }),
    ])
  })

  test('uses cached children for parent id', async () => {
    const service = createFragmentService()
    await service.fetchProvenanceChildren('babylonia')
    await service.fetchProvenanceChildren('babylonia')
    expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(1)
  })
})

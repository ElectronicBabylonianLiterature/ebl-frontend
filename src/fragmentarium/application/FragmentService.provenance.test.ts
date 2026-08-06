import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  createFragmentServiceTestContext,
  FragmentServiceTestContext,
  rejectBibliographyLookups,
} from 'fragmentarium/application/FragmentService.testSupport'

jest.mock('bibliography/application/BibliographyService', () => {
  return function () {
    return { find: jest.fn(), findMany: jest.fn(), search: jest.fn() }
  }
})

jest.mock('dictionary/infrastructure/WordRepository', () => {
  return function () {
    return { searchLemma: jest.fn(), find: jest.fn(), findAll: jest.fn() }
  }
})

const provenanceOptions: readonly ProvenanceRecord[] = [
  {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bab',
    parent: 'Babylonia',
    sortKey: 20,
    coordinates: {
      latitude: 32.542,
      longitude: 44.42,
    },
    polygonCoordinates: [
      { latitude: 32.51, longitude: 44.4 },
      { latitude: 32.53, longitude: 44.44 },
      { latitude: 32.55, longitude: 44.41 },
    ],
  },
  {
    id: 'assur',
    longName: 'Aššur',
    abbreviation: 'Ašš',
    parent: 'Assyria',
    sortKey: 10,
    polygonCoordinates: [
      { latitude: 36.34, longitude: 43.1 },
      { latitude: 36.35, longitude: 43.12 },
    ],
  },
  {
    id: 'sippar',
    longName: 'Sippar',
    abbreviation: 'Sip',
    parent: 'Babylonia',
    sortKey: 30,
    coordinates: {
      latitude: Number.NaN,
      longitude: 44.25,
    },
    polygonCoordinates: [
      { latitude: 33.1, longitude: 44.2 },
      { latitude: Number.NaN, longitude: 44.3 },
      { latitude: 33.2, longitude: 44.4 },
      { latitude: 33.3, longitude: 44.35 },
    ],
  },
]

const childrenOptions: readonly ProvenanceRecord[] = [
  {
    id: 'nippur',
    longName: 'Nippur',
    abbreviation: 'Nip',
    parent: 'Babylonia',
    sortKey: 2,
    coordinates: {
      latitude: 32.12,
      longitude: 45.12,
      uncertaintyRadiusKm: 4,
    },
  },
  {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bab',
    parent: 'Babylonia',
    sortKey: 1,
  },
]

const context: FragmentServiceTestContext = createFragmentServiceTestContext()

beforeEach(() => {
  rejectBibliographyLookups(context.bibliographyService)
})

describe('fetch provenances', () => {
  let provenanceResult: readonly ProvenanceRecord[]

  beforeEach(async () => {
    context.fragmentRepository.fetchProvenances.mockReturnValue(
      Promise.resolve(provenanceOptions),
    )
    provenanceResult = await context.fragmentService.fetchProvenances()
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
    const service = context.createService()
    await service.fetchProvenances()
    await service.fetchProvenances()
    expect(context.fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(1)
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
    context.fragmentRepository.fetchProvenance.mockReturnValue(
      Promise.resolve(provenenceById),
    )
  })

  test('returns provenance by id', async () => {
    await expect(
      context.fragmentService.fetchProvenance('uruk'),
    ).resolves.toEqual(provenenceById)
    expect(context.fragmentRepository.fetchProvenance).toHaveBeenCalledWith(
      'uruk',
    )
  })

  test('uses cached provenance by id', async () => {
    const service = context.createService()
    await service.fetchProvenance('uruk')
    await service.fetchProvenance('uruk')
    expect(context.fragmentRepository.fetchProvenance).toHaveBeenCalledTimes(1)
  })
})

describe('fetch provenance children', () => {
  beforeEach(() => {
    context.fragmentRepository.fetchProvenanceChildren.mockReturnValue(
      Promise.resolve(childrenOptions),
    )
  })

  test('returns children for parent id in API order', async () => {
    await expect(
      context.fragmentService.fetchProvenanceChildren('babylonia'),
    ).resolves.toEqual([
      expect.objectContaining({ id: 'nippur' }),
      expect.objectContaining({ id: 'babylon' }),
    ])
  })

  test('uses cached children for parent id', async () => {
    const service = context.createService()
    await service.fetchProvenanceChildren('babylonia')
    await service.fetchProvenanceChildren('babylonia')
    expect(
      context.fragmentRepository.fetchProvenanceChildren,
    ).toHaveBeenCalledTimes(1)
  })
})

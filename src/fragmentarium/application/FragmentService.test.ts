import Folio from 'fragmentarium/domain/Folio'
import { fragment } from 'test-support/test-fragment'
import createLemmatizationTestText from 'test-support/test-text'
import { TestData, testDelegation } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import FragmentService from './FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { produce, castDraft, Draft } from 'immer'
import { Genres } from 'fragmentarium/domain/Genres'
import { Colophon } from 'fragmentarium/domain/Colophon'
import Word from 'dictionary/domain/Word'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import LemmatizationFactory from './LemmatizationFactory'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import {
  fragmentFactory,
  manuscriptAttestationFactory,
  uncertainFragmentAttestationFactory,
} from 'test-support/fragment-fixtures'
import { archaeologyFactory } from 'test-support/fragment-data-fixtures'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { wordFactory } from 'test-support/word-fixtures'
import { silenceConsoleErrors } from 'setupTests'
import { QueryResult } from 'query/QueryResult'
import { FragmentQuery } from 'query/FragmentQuery'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Archaeology } from 'fragmentarium/domain/archaeology'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { toArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

jest.mock('./LemmatizationFactory')

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

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const word: Word = wordFactory.build()
const lemmaSuggestions = new Map([['foo', new LemmaOption(word)]])
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  updateLemmatization: jest.fn(),
  updateGenres: jest.fn(),
  updateScript: jest.fn(),
  updateDate: jest.fn(),
  updateDatesInText: jest.fn(),
  fetchGenres: jest.fn(),
  fetchProvenances: jest.fn(),
  fetchProvenance: jest.fn(),
  fetchProvenanceChildren: jest.fn(),
  fetchPeriods: jest.fn(),
  fetchColophonNames: jest.fn(),
  updateReferences: jest.fn(),
  updateArchaeology: jest.fn(),
  updateColophon: jest.fn(),
  folioPager: jest.fn(),
  fragmentPager: jest.fn(),
  findLemmas: jest.fn(),
  findAnnotations: jest.fn(),
  updateAnnotations: jest.fn(),
  lineToVecRanking: jest.fn(),
  findInCorpus: jest.fn(),
  query: jest.fn(),
  queryLatest: jest.fn(),
  listAllFragments: jest.fn(),
  queryByTraditionalReferences: jest.fn(),
  updateScopes: jest.fn(),
  updateEdition: jest.fn(),
  updateLemmaAnnotation: jest.fn(),
  collectLemmaSuggestions: jest.fn(),
  fetchNamedEntityAnnotations: jest.fn(),
  updateNamedEntityAnnotations: jest.fn(),
}

const imageRepository = {
  find: jest.fn(),
  findFolio: jest.fn(),
  findPhoto: jest.fn(),
  findThumbnail: jest.fn(),
}
const bibliographyService = new (BibliographyService as jest.Mock)()
const wordRepository = new (WordRepository as jest.Mock)()
const fragmentService = new FragmentService(
  fragmentRepository,
  imageRepository,
  wordRepository,
  bibliographyService,
)
const lemmas = 'foo I+bar II'
const queryResultStub: QueryResult = { items: [], matchCountTotal: 0 }

const testData: TestData<FragmentService>[] = [
  new TestData('statistics', [], fragmentRepository.statistics, resultStub, [
    undefined,
  ]),
  new TestData(
    'lineToVecRanking',
    ['X.0'],
    fragmentRepository.lineToVecRanking,
    resultStub,
    ['X.0', undefined],
  ),
  new TestData('findFolio', [folio], imageRepository.findFolio, resultStub, [
    folio,
    undefined,
  ]),
  new TestData('findImage', [fileName], imageRepository.find, resultStub, [
    fileName,
  ]),
  new TestData('findPhoto', [fragment], imageRepository.findPhoto, resultStub, [
    fragment.number,
    undefined,
  ]),
  new TestData(
    'findThumbnail',
    [fragment, 'small'],
    imageRepository.findThumbnail,
    resultStub,
    [fragment.number, 'small'],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'folioPager',
    [folio, 'K.1'],
    fragmentRepository.folioPager,
    resultStub,
  ),
  new TestData(
    'fragmentPager',
    ['K.1'],
    fragmentRepository.fragmentPager,
    resultStub,
    ['K.1', undefined],
  ),
  new TestData('searchLemma', ['lemma'], wordRepository.searchLemma, [
    resultStub,
  ]),
  new TestData(
    'searchBibliography',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyService.search,
    [resultStub],
  ),
  new TestData(
    'findAnnotations',
    [fragment.number, false],
    fragmentRepository.findAnnotations,
    resultStub,
  ),
  new TestData(
    'generateAnnotations',
    [fragment.number, true],
    fragmentRepository.findAnnotations,
    resultStub,
  ),
  new TestData(
    'updateAnnotations',
    [fragment.number, resultStub],
    fragmentRepository.updateAnnotations,
    resultStub,
    undefined,
    Promise.resolve(resultStub),
  ),
  new TestData(
    'findSuggestions',
    ['kur', true],
    fragmentRepository.findLemmas,
    [[new Lemma(word)]],
    ['kur', true],
    Promise.resolve([[word]]),
  ),
  new TestData(
    'listAllFragments',
    [],
    fragmentRepository.listAllFragments,
    [],
    [],
    Promise.resolve([]),
  ),
  new TestData(
    'collectLemmaSuggestions',
    ['K.1'],
    fragmentRepository.collectLemmaSuggestions,
    lemmaSuggestions,
    ['K.1'],
    Promise.resolve(lemmaSuggestions),
  ),
]

testDelegation(fragmentService, testData)

describe.each(['searchLemma'])('%s', (method) => {
  test('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
})

describe('findPhoto', () => {
  test("throws when fragment doesn't have a photo", () => {
    const fragmentWithoutPhoto = produce(
      fragmentFactory.build({ number: 'X.1' }),
      (draft: Draft<Fragment>) => {
        draft.hasPhoto = false
      },
    )

    expect(() => fragmentService.findPhoto(fragmentWithoutPhoto)).toThrowError(
      "Fragment X.1 doesn't have a Photo",
    )
  })
})

describe('isInFragmentarium', () => {
  test('returns true when repository find does not throw synchronously', () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))

    expect(fragmentService.isInFragmentarium('K.1')).toBe(true)
  })

  test('returns false when repository find throws synchronously', () => {
    fragmentRepository.find.mockImplementation(() => {
      throw new Error('not found')
    })

    expect(fragmentService.isInFragmentarium('K.404')).toBe(false)
  })
})

describe('methods returning fragment', () => {
  const number = 'K.1'
  let fragment: Fragment
  let result: Fragment
  let genreResult: string[][]
  let colophonNamesResult: string[]
  let provenanceResult: readonly ProvenanceRecord[]
  const genreOptions = [['ARCHIVE', 'Administrative']]
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
  const genres: Genres = Genres.fromJson([
    { category: ['ARCHIVE', 'Administrative'], uncertain: false },
  ])
  const colophonNamesOptions = [['Humbaba', 'Enkidu']]
  const date: MesopotamianDate = MesopotamianDate.fromJson({
    year: { value: '1' },
    month: { value: '1' },
    day: { value: '1' },
    king: { orderGlobal: 1 },
    isSeleucidEra: true,
  })
  const datesInText: MesopotamianDate[] = [date]
  let archaeology: Archaeology
  let archaeologyDto: ArchaeologyDto

  beforeEach(() => {
    const references = bibliographyEntryFactory
      .buildList(2)
      .map((entry: BibliographyEntry) =>
        referenceFactory.build({}, { associations: { document: entry } }),
      )
    fragment = fragmentFactory.build(
      { number: number },
      { associations: { references: references, genres: new Genres([]) } },
    )
    bibliographyService.find.mockImplementation((id: string) =>
      Promise.reject(new Error(`${id} not found.`)),
    )
    bibliographyService.findMany.mockImplementation((ids: string[]) =>
      Promise.reject(new Error(`${ids} not found.`)),
    )
    silenceConsoleErrors()
  })

  describe('find', () => {
    beforeEach(async () => {
      const service = new FragmentService(
        fragmentRepository,
        imageRepository,
        wordRepository,
        bibliographyService,
      )
      fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
      result = await service.find(number)
    })

    test('Returns fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () => {
      expect(fragmentRepository.find).toHaveBeenCalledWith(
        number,
        undefined,
        undefined,
      )
    })
  })

  describe('Reject with permission denied', () => {
    test('Throws permission error', async () => {
      fragmentRepository.find.mockReturnValueOnce(
        Promise.reject(new Error('403 Forbidden')),
      )
      await expect(fragmentService.find('X.1')).rejects.toThrowError(
        "You don't have permissions to view this fragment.",
      )
    })
  })

  describe('update edition', () => {
    const edition = {
      transliteration: '1. kur',
      notes: 'notes',
      introduction: 'Introductory @i{text}',
    }

    beforeEach(async () => {
      fragmentRepository.updateEdition.mockReturnValue(
        Promise.resolve(fragment),
      )
      result = await fragmentService.updateEdition(fragment.number, edition)
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () => {
      expect(fragmentRepository.updateEdition).toHaveBeenCalledWith(
        fragment.number,
        edition,
      )
    })
  })

  describe('fetch genres', () => {
    beforeEach(async () => {
      fragmentRepository.fetchGenres.mockReturnValue(
        Promise.resolve(genreOptions),
      )
      genreResult = await fragmentService.fetchGenres()
    })
    test('returns genres', () => expect(genreResult).toEqual(genreOptions))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.fetchGenres).toHaveBeenCalled())
  })

  describe('fetch periods', () => {
    let periodsResult: string[]
    const periodsOptions = ['Old Babylonian']

    beforeEach(async () => {
      fragmentRepository.fetchPeriods.mockReturnValue(
        Promise.resolve(periodsOptions),
      )
      periodsResult = await fragmentService.fetchPeriods()
    })

    test('returns periods', () => expect(periodsResult).toEqual(periodsOptions))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.fetchPeriods).toHaveBeenCalled())
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
      const service = new FragmentService(
        fragmentRepository,
        imageRepository,
        wordRepository,
        bibliographyService,
      )
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
      const service = new FragmentService(
        fragmentRepository,
        imageRepository,
        wordRepository,
        bibliographyService,
      )
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
      const service = new FragmentService(
        fragmentRepository,
        imageRepository,
        wordRepository,
        bibliographyService,
      )
      await service.fetchProvenanceChildren('babylonia')
      await service.fetchProvenanceChildren('babylonia')
      expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(
        1,
      )
    })
  })

  describe('fetch colophon names', () => {
    beforeEach(async () => {
      fragmentRepository.fetchColophonNames.mockReturnValue(
        Promise.resolve(colophonNamesOptions),
      )
      colophonNamesResult = await fragmentService.fetchColophonNames('u')
    })
    test('returns names', () =>
      expect(colophonNamesResult).toEqual(colophonNamesOptions))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.fetchColophonNames).toHaveBeenCalled())
  })

  describe('update genre', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.genres = castDraft(genres)
      })
      fragmentRepository.updateGenres.mockReturnValue(
        Promise.resolve(expectedFragment),
      )
      result = await fragmentService.updateGenres(fragment.number, genres)
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateGenres).toHaveBeenCalledWith(
        fragment.number,
        genres,
      ))
  })

  const scopes = ['read:fragments', 'write:fragments']

  describe.each([
    {
      description: 'update script',
      repositoryMethod: fragmentRepository.updateScript,
      expectedValue: () => fragment.script,
      extraArgs: [undefined],
      serviceCall: (number: string) =>
        fragmentService.updateScript(number, fragment.script),
    },
    {
      description: 'update scopes',
      repositoryMethod: fragmentRepository.updateScopes,
      expectedValue: () => scopes,
      extraArgs: [],
      serviceCall: (number: string) =>
        fragmentService.updateScopes(number, scopes),
    },
  ])(
    '$description',
    ({ repositoryMethod, expectedValue, extraArgs, serviceCall }) => {
      beforeEach(async () => {
        repositoryMethod.mockReturnValue(Promise.resolve(fragment))
        result = await serviceCall(fragment.number)
      })

      test('returns updated fragment', () => expect(result).toEqual(fragment))
      test('calls repository with correct parameters', () =>
        expect(repositoryMethod).toHaveBeenCalledWith(
          fragment.number,
          expectedValue(),
          ...extraArgs,
        ))
    },
  )

  describe('update date', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.date = castDraft(date)
      })
      fragmentRepository.updateDate.mockReturnValue(
        Promise.resolve(expectedFragment),
      )
      result = await fragmentService.updateDate(fragment.number, date.toDto())
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateDate).toHaveBeenCalledWith(
        fragment.number,
        date.toDto(),
      ))
  })

  describe('delete date', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.date = undefined
      })
      fragmentRepository.updateDate.mockReturnValue(
        Promise.resolve(expectedFragment),
      )
      result = await fragmentService.updateDate(fragment.number, undefined)
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateDate).toHaveBeenCalledWith(
        fragment.number,
        undefined,
      ))
  })

  describe('update dates in text', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.datesInText = castDraft(datesInText)
      })
      fragmentRepository.updateDatesInText.mockReturnValue(
        Promise.resolve(expectedFragment),
      )
      result = await fragmentService.updateDatesInText(
        fragment.number,
        datesInText.filter((date) => date).map((date) => date.toDto()),
      )
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateDatesInText).toHaveBeenCalledWith(
        fragment.number,
        datesInText.filter((date) => date).map((date) => date.toDto()),
      ))
  })

  describe('update archaeology', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      archaeology = archaeologyFactory.build()
      archaeologyDto = toArchaeologyDto(archaeology)
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.archaeology = castDraft(archaeology)
      })
      fragmentRepository.updateArchaeology.mockReturnValue(
        Promise.resolve(expectedFragment),
      )
      result = await fragmentService.updateArchaeology(
        fragment.number,
        archaeologyDto,
      )
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateArchaeology).toHaveBeenCalledWith(
        fragment.number,
        archaeologyDto,
      ))
  })

  describe('update lemmatization', () => {
    const lemmatization: Lemmatization = new Lemmatization(
      ['1.'],
      [[new LemmatizationToken('kur', true, [])]],
    )

    beforeEach(async () => {
      fragmentRepository.updateLemmatization.mockReturnValue(
        Promise.resolve(fragment),
      )
      result = await fragmentService.updateLemmatization(
        fragment.number,
        lemmatization.toDto(),
      )
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateLemmatization).toHaveBeenCalledWith(
        fragment.number,
        lemmatization.toDto(),
      ))
  })

  describe('update references', () => {
    beforeEach(async () => {
      fragmentRepository.updateReferences.mockReturnValue(
        Promise.resolve(fragment),
      )
      result = await fragmentService.updateReferences(
        fragment.number,
        fragment.references,
      )
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateReferences).toHaveBeenCalledWith(
        fragment.number,
        fragment.references,
      ))
  })

  describe('update lemma annotation', () => {
    const annotations: LineLemmaAnnotations = {
      0: {
        0: ['lemma-a'],
      },
    }

    beforeEach(async () => {
      fragmentRepository.updateLemmaAnnotation.mockReturnValue(
        Promise.resolve(fragment),
      )
      result = await fragmentService.updateLemmaAnnotation(
        fragment.number,
        annotations,
      )
    })

    test('returns updated fragment', () => expect(result).toEqual(fragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateLemmaAnnotation).toHaveBeenCalledWith(
        fragment.number,
        annotations,
      ))
  })

  describe('update colophon', () => {
    const colophon = new Colophon({ notesToScribalProcess: 'test note' })

    beforeEach(async () => {
      fragmentRepository.updateColophon.mockReturnValue(
        Promise.resolve(fragment),
      )
      result = await fragmentService.updateColophon(fragment.number, colophon)
    })

    test('returns updated fragment', () => expect(result).toEqual(fragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateColophon).toHaveBeenCalledWith(
        fragment.number,
        colophon,
      ))
  })

  describe('fetch named entity annotations', () => {
    const namedEntityAnnotations: readonly ApiEntityAnnotationSpan[] = [
      {
        id: 'entity-1',
        type: 'PERSONAL_NAME',
        span: ['line:1'],
      },
    ]

    test('returns named entity annotations', async () => {
      fragmentRepository.fetchNamedEntityAnnotations.mockReturnValue(
        Promise.resolve(namedEntityAnnotations),
      )

      await expect(
        fragmentService.fetchNamedEntityAnnotations(fragment.number),
      ).resolves.toEqual(namedEntityAnnotations)
      expect(
        fragmentRepository.fetchNamedEntityAnnotations,
      ).toHaveBeenCalledWith(fragment.number)
    })
  })

  describe('update named entity annotations', () => {
    const namedEntityAnnotations: readonly ApiEntityAnnotationSpan[] = [
      {
        id: 'entity-1',
        type: 'PERSONAL_NAME',
        span: ['line:1'],
      },
    ]

    beforeEach(async () => {
      fragmentRepository.updateNamedEntityAnnotations.mockReturnValue(
        Promise.resolve(fragment),
      )
      result = await fragmentService.updateNamedEntityAnnotations(
        fragment.number,
        namedEntityAnnotations,
      )
    })

    test('returns updated fragment', () => expect(result).toEqual(fragment))
    test('calls repository with correct parameters', () =>
      expect(
        fragmentRepository.updateNamedEntityAnnotations,
      ).toHaveBeenCalledWith(fragment.number, namedEntityAnnotations))
  })
})

test('createLemmatization', async () => {
  const [text] = await createLemmatizationTestText()
  const lemmatization = new Lemmatization([], [])

  const createLemmatization = jest.fn<Promise<Lemmatization>, [Text]>()
  createLemmatization.mockReturnValue(Promise.resolve(lemmatization))
  const MockLemmatizationFactory = LemmatizationFactory as jest.Mock
  MockLemmatizationFactory.mockImplementation(() => ({ createLemmatization }))

  const result = await fragmentService.createLemmatization(text)
  expect(MockLemmatizationFactory).toHaveBeenCalledWith(
    fragmentService,
    wordRepository,
  )
  expect(createLemmatization).toBeCalledWith(text)
  expect(result).toEqual(lemmatization)
})

describe('search for fragment in corpus', () => {
  const number = 'K.1'
  const manuscriptAttestation = manuscriptAttestationFactory.build(
    {},
    { transient: { museumNumber: 'K.1' } },
  )
  const uncertainFragmentAttestation =
    uncertainFragmentAttestationFactory.build()
  let result: {
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }
  const testData = {
    manuscriptAttestations: [manuscriptAttestation],
    uncertainFragmentAttestations: [uncertainFragmentAttestation],
  }
  beforeEach(async () => {
    fragmentRepository.findInCorpus.mockReturnValue(Promise.resolve(testData))
    result = await fragmentService.findInCorpus(number)
  })
  test('returns attestation data', () => expect(result).toEqual(testData))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.findInCorpus).toHaveBeenCalled())
})

const queryTestCases = [
  { lemmas: 'ina I' },
  { lemmas: lemmas, queryOperator: 'and' },
  { lemmas: lemmas, queryOperator: 'or' },
  { lemmas: lemmas, queryOperator: 'line' },
  { lemmas: lemmas, queryOperator: 'phrase' },
  { bibId: 'id' },
  { bibId: 'id', pages: '42' },
  { transliteration: 'me lik\nkur kur' },
  { number: 'X.1' },
  {
    number: 'M.2',
    bibId: 'id',
    pages: '123',
    transliteration: 'ana',
    lemmas: 'šumma I+ina I+qanû I',
    lemmaOperator: 'line',
  },
]

const queryTestData: TestData<FragmentService>[] = queryTestCases.map(
  (parameters) =>
    new TestData(
      'query',
      [parameters],
      fragmentRepository.query,
      queryResultStub,
      [parameters],
      Promise.resolve(queryResultStub),
    ),
)

describe('Query FragmentService', () =>
  testDelegation(fragmentService, queryTestData))

describe('FragmentService cache', () => {
  const cacheTtlMilliseconds = 5 * 60 * 1000

  const number = 'K.1'
  const query: FragmentQuery = { lemmas: 'ina I', number: number }
  const reorderedQuery: FragmentQuery = { number: number, lemmas: 'ina I' }
  const edition = {
    transliteration: '1. kur',
    notes: 'notes',
    introduction: 'intro',
  }

  let service: FragmentService
  let cachedFragment: Fragment
  let updatedFragment: Fragment
  let queryResult: QueryResult
  let updatedQueryResult: QueryResult

  const withExpiredCacheTimestamp = async (
    runTest: (expireCache: () => void) => PromiseLike<void> | void,
  ): globalThis.Promise<void> => {
    let currentTime = 0
    const dateNow = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => currentTime)
    const expireCache = (): void => {
      currentTime = cacheTtlMilliseconds + 1
    }

    try {
      await runTest(expireCache)
    } finally {
      dateNow.mockRestore()
    }
  }

  const createScopedService = (getCacheScope: () => string): FragmentService =>
    new FragmentService(
      fragmentRepository,
      imageRepository,
      wordRepository,
      bibliographyService,
      getCacheScope,
    )

  beforeEach(() => {
    jest.clearAllMocks()
    service = new FragmentService(
      fragmentRepository,
      imageRepository,
      wordRepository,
      bibliographyService,
    )
    cachedFragment = fragmentFactory.build({ number: number })
    updatedFragment = fragmentFactory.build({ number: number })
    queryResult = {
      items: [{ museumNumber: number, matchingLines: [], matchCount: 1 }],
      matchCountTotal: 1,
    }
    updatedQueryResult = { items: [], matchCountTotal: 0 }
    bibliographyService.find.mockImplementation((id: string) =>
      Promise.reject(new Error(`${id} not found.`)),
    )
    bibliographyService.findMany.mockResolvedValue([])
  })

  test('caches fragment reads by number and line options', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await expect(service.find(number, [1], true)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(service.find(number, [1], true)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.find).toHaveBeenCalledWith(number, [1], true)
  })

  test('fetches fragment reads separately for different line options', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await service.find(number, [1], true)
    await service.find(number, [2], true)

    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('shares in-flight fragment reads', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    const firstResult = service.find(number)
    const secondResult = service.find(number)

    await expect(firstResult).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(secondResult).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('does not cache failed fragment reads', async () => {
    fragmentRepository.find
      .mockReturnValueOnce(Promise.reject(new Error('failed')))
      .mockReturnValueOnce(Promise.resolve(cachedFragment))

    await expect(service.find(number)).rejects.toThrow('failed')
    await expect(service.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('refreshes expired fragment reads', async () => {
    fragmentRepository.find
      .mockReturnValueOnce(Promise.resolve(cachedFragment))
      .mockReturnValueOnce(Promise.resolve(updatedFragment))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(service.find(number)).resolves.toMatchObject({
        number: cachedFragment.number,
      })
      expireCache()
      await expect(service.find(number)).resolves.toMatchObject({
        number: updatedFragment.number,
      })
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('evicts oldest fragment cache entry when max size is exceeded', async () => {
    fragmentRepository.find.mockImplementation((fragmentNumber: string) =>
      Promise.resolve(fragmentFactory.build({ number: fragmentNumber })),
    )

    for (let index = 0; index <= 250; index += 1) {
      await service.find(`K.${index}`)
    }

    await service.find('K.0')

    expect(fragmentRepository.find).toHaveBeenCalledTimes(252)
  })

  test('caches latest query results', async () => {
    fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))

    await expect(service.queryLatest()).resolves.toEqual(queryResult)
    await expect(service.queryLatest()).resolves.toEqual(queryResult)

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(1)
  })

  test('refreshes expired latest query results', async () => {
    fragmentRepository.queryLatest
      .mockReturnValueOnce(Promise.resolve(queryResult))
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(service.queryLatest()).resolves.toEqual(queryResult)
      expireCache()
      await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)
    })

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
  })

  test('shares in-flight latest query requests', async () => {
    fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))

    const firstResult = service.queryLatest()
    const secondResult = service.queryLatest()

    await expect(firstResult).resolves.toEqual(queryResult)
    await expect(secondResult).resolves.toEqual(queryResult)

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(1)
  })

  test('serves prefetched latest fragments without repository reads', async () => {
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(service.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: cachedFragment.number,
      },
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: cachedFragment.number,
      },
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
  })

  test('stores prefetched latest fragments after cache scope changes', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: updatedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    cacheScope = 'authenticated:user'

    await expect(scopedService.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(
      scopedService.find(number, [1, 2, 3], false),
    ).resolves.toMatchObject({
      number: updatedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('falls back to repository reads when prefetched latest key does not match', async () => {
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [8, 9],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )
    fragmentRepository.find.mockReturnValue(Promise.resolve(updatedFragment))

    await expect(service.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.find).toHaveBeenCalledWith(
      number,
      [1, 2, 3],
      false,
    )
  })

  test('normalizes prefetched fragment errors using onError', async () => {
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    const injectReferencesMock = jest
      .spyOn(
        service as unknown as {
          injectReferences: (fragment: Fragment) => Promise<Fragment>
        },
        'injectReferences',
      )
      .mockReturnValue(Promise.reject(new Error('403 Forbidden')))
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(service.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).rejects.toThrow(
      "You don't have permissions to view this fragment.",
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
    injectReferencesMock.mockRestore()
  })

  test('caches completed query results', async () => {
    fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))

    await expect(service.query(query)).resolves.toEqual(queryResult)
    await expect(service.query(query)).resolves.toEqual(queryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(1)
  })

  test('serves prefetched fragments from regular query results', async () => {
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }

    fragmentRepository.query.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(service.query(query)).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: cachedFragment.number,
      },
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
  })

  test('refreshes expired query results', async () => {
    fragmentRepository.query
      .mockReturnValueOnce(Promise.resolve(queryResult))
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(service.query(query)).resolves.toEqual(queryResult)
      expireCache()
      await expect(service.query(query)).resolves.toEqual(updatedQueryResult)
    })

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('evicts oldest query cache entry when max size is exceeded', async () => {
    fragmentRepository.query.mockImplementation(
      (fragmentQuery: FragmentQuery) =>
        Promise.resolve({
          items: [
            {
              museumNumber: fragmentQuery.number ?? number,
              matchingLines: [],
              matchCount: 1,
            },
          ],
          matchCountTotal: 1,
        }),
    )

    for (let index = 0; index <= 250; index += 1) {
      await service.query({ number: `K.${index}` })
    }

    await service.query({ number: 'K.0' })

    expect(fragmentRepository.query).toHaveBeenCalledTimes(252)
  })

  test('shares in-flight query requests by stable query key', async () => {
    fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))

    const firstResult = service.query(query)
    const secondResult = service.query(reorderedQuery)

    await expect(firstResult).resolves.toEqual(queryResult)
    await expect(secondResult).resolves.toEqual(queryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(1)
  })

  test('re-fetches after a failed in-flight query', async () => {
    fragmentRepository.query
      .mockReturnValueOnce(Promise.reject(new Error('fail')))
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    await expect(service.query(query)).rejects.toThrow('fail')

    const secondQuery = service.query(query)

    await expect(secondQuery).resolves.toEqual(updatedQueryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('caches thumbnails by fragment number and size', async () => {
    const thumbnail = { blob: null }
    imageRepository.findThumbnail.mockReturnValue(Promise.resolve(thumbnail))

    await expect(service.findThumbnail(cachedFragment, 'small')).resolves.toBe(
      thumbnail,
    )
    await expect(service.findThumbnail(cachedFragment, 'small')).resolves.toBe(
      thumbnail,
    )

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(1)
    expect(imageRepository.findThumbnail).toHaveBeenCalledWith(number, 'small')
  })

  test('refreshes expired thumbnails', async () => {
    const thumbnail = { blob: null }
    const refreshedThumbnail = { blob: new Blob(['refreshed']) }
    imageRepository.findThumbnail
      .mockReturnValueOnce(Promise.resolve(thumbnail))
      .mockReturnValueOnce(Promise.resolve(refreshedThumbnail))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(
        service.findThumbnail(cachedFragment, 'small'),
      ).resolves.toBe(thumbnail)
      expireCache()
      await expect(
        service.findThumbnail(cachedFragment, 'small'),
      ).resolves.toBe(refreshedThumbnail)
    })

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(2)
  })

  test('evicts oldest thumbnail cache entry when max size is exceeded', async () => {
    imageRepository.findThumbnail.mockImplementation((fragmentNumber: string) =>
      Promise.resolve({ blob: new Blob([fragmentNumber]) }),
    )

    for (let index = 0; index <= 250; index += 1) {
      await service.findThumbnail(
        fragmentFactory.build({ number: `K.${index}` }),
        'small',
      )
    }

    await service.findThumbnail(
      fragmentFactory.build({ number: 'K.0' }),
      'small',
    )

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(252)
  })

  test('caches empty provenance list results', async () => {
    fragmentRepository.fetchProvenances.mockReturnValue(Promise.resolve([]))

    await expect(service.fetchProvenances()).resolves.toEqual([])
    await expect(service.fetchProvenances()).resolves.toEqual([])

    expect(fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(1)
  })

  test('caches empty provenance children results', async () => {
    fragmentRepository.fetchProvenanceChildren.mockReturnValue(
      Promise.resolve([]),
    )

    await expect(service.fetchProvenanceChildren('P.empty')).resolves.toEqual(
      [],
    )
    await expect(service.fetchProvenanceChildren('P.empty')).resolves.toEqual(
      [],
    )

    expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledWith(
      'P.empty',
    )
  })

  test('clears cached fragment values when cache scope changes', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    fragmentRepository.find
      .mockReturnValueOnce(Promise.resolve(cachedFragment))
      .mockReturnValueOnce(Promise.resolve(updatedFragment))

    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    cacheScope = 'authenticated:user'
    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('uses default cache scope when cache scope resolver throws', async () => {
    const scopedService = createScopedService(() => {
      throw new Error('scope resolver failed')
    })
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('clears cached thumbnail values across auth transitions', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    const guestThumbnail = { blob: new Blob(['guest']) }
    const userAThumbnail = { blob: new Blob(['user-a']) }
    const userBThumbnail = { blob: new Blob(['user-b']) }
    const guestThumbnailAfterLogout = { blob: new Blob(['guest-after']) }

    imageRepository.findThumbnail
      .mockReturnValueOnce(Promise.resolve(guestThumbnail))
      .mockReturnValueOnce(Promise.resolve(userAThumbnail))
      .mockReturnValueOnce(Promise.resolve(userBThumbnail))
      .mockReturnValueOnce(Promise.resolve(guestThumbnailAfterLogout))

    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(guestThumbnail)
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(guestThumbnail)

    cacheScope = 'authenticated:user-a'
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(userAThumbnail)

    cacheScope = 'authenticated:user-b'
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(userBThumbnail)

    cacheScope = 'guest'
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(guestThumbnailAfterLogout)

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(4)
  })

  test('clears cached provenance values across auth transitions', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    const guestProvenances: readonly ProvenanceRecord[] = [
      {
        id: 'guest-site',
        longName: 'Guest Site',
        abbreviation: 'GS',
        parent: 'Guest',
        sortKey: 1,
      },
    ]
    const userAProvenances: readonly ProvenanceRecord[] = [
      {
        id: 'user-a-site',
        longName: 'User A Site',
        abbreviation: 'UA',
        parent: 'User A',
        sortKey: 1,
      },
    ]
    const userBProvenances: readonly ProvenanceRecord[] = [
      {
        id: 'user-b-site',
        longName: 'User B Site',
        abbreviation: 'UB',
        parent: 'User B',
        sortKey: 1,
      },
    ]
    const guestProvenancesAfterLogout: readonly ProvenanceRecord[] = [
      {
        id: 'guest-site-after',
        longName: 'Guest Site After',
        abbreviation: 'GSA',
        parent: 'Guest',
        sortKey: 1,
      },
    ]

    fragmentRepository.fetchProvenances
      .mockReturnValueOnce(Promise.resolve(guestProvenances))
      .mockReturnValueOnce(Promise.resolve(userAProvenances))
      .mockReturnValueOnce(Promise.resolve(userBProvenances))
      .mockReturnValueOnce(Promise.resolve(guestProvenancesAfterLogout))

    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      guestProvenances,
    )
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      guestProvenances,
    )

    cacheScope = 'authenticated:user-a'
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      userAProvenances,
    )

    cacheScope = 'authenticated:user-b'
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      userBProvenances,
    )

    cacheScope = 'guest'
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      guestProvenancesAfterLogout,
    )

    expect(fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(4)
  })

  test('clears in-flight query requests when scope changes from guest to authenticated', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    let resolveGuestQuery: (value: QueryResult) => void = () => undefined
    const guestQuery = new Promise<QueryResult>((resolve) => {
      resolveGuestQuery = resolve
    })

    fragmentRepository.query
      .mockReturnValueOnce(guestQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    const guestInFlight = scopedService.query(query)

    cacheScope = 'authenticated:user-a'
    await expect(scopedService.query(query)).resolves.toEqual(
      updatedQueryResult,
    )

    resolveGuestQuery(queryResult)
    await expect(guestInFlight).resolves.toEqual(queryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('clears in-flight latest query requests across auth transitions', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    let resolveGuestQuery: (value: QueryResult) => void = () => undefined
    let resolveUserAQuery: (value: QueryResult) => void = () => undefined
    let resolveUserBQuery: (value: QueryResult) => void = () => undefined
    const guestQuery = new Promise<QueryResult>((resolve) => {
      resolveGuestQuery = resolve
    })
    const userAQuery = new Promise<QueryResult>((resolve) => {
      resolveUserAQuery = resolve
    })
    const userBQuery = new Promise<QueryResult>((resolve) => {
      resolveUserBQuery = resolve
    })

    fragmentRepository.queryLatest
      .mockReturnValueOnce(guestQuery)
      .mockReturnValueOnce(userAQuery)
      .mockReturnValueOnce(userBQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    const guestInFlight = scopedService.queryLatest()

    cacheScope = 'authenticated:user-a'
    const userAInFlight = scopedService.queryLatest()

    cacheScope = 'authenticated:user-b'
    const userBInFlight = scopedService.queryLatest()

    cacheScope = 'guest'
    await expect(scopedService.queryLatest()).resolves.toEqual(
      updatedQueryResult,
    )

    resolveGuestQuery(queryResult)
    resolveUserAQuery(queryResult)
    resolveUserBQuery(queryResult)

    await expect(guestInFlight).resolves.toEqual(queryResult)
    await expect(userAInFlight).resolves.toEqual(queryResult)
    await expect(userBInFlight).resolves.toEqual(queryResult)

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(4)
  })

  test('invalidates fragment and query caches after update', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))
    fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))
    fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    await service.find(number)
    await service.query(query)
    await service.queryLatest()
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    fragmentRepository.query.mockReturnValue(
      Promise.resolve(updatedQueryResult),
    )
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(updatedQueryResult),
    )

    await expect(service.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })
    await expect(service.query(query)).resolves.toEqual(updatedQueryResult)
    await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
  })

  test('does not cache stale fragment reads that resolve after update', async () => {
    let resolveStaleRead: (value: Fragment) => void = () => undefined
    const staleRead = new Promise<Fragment>((resolve) => {
      resolveStaleRead = resolve
    })
    const staleFragment = fragmentFactory.build({ number: number })
    fragmentRepository.find.mockReturnValue(staleRead)
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    const inFlightRead = service.find(number)
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    resolveStaleRead(staleFragment)

    await expect(inFlightRead).resolves.toMatchObject({
      number: staleFragment.number,
    })
    await expect(service.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('does not cache stale query results that resolve after update', async () => {
    let resolveStaleQuery: (value: QueryResult) => void = () => undefined
    const staleQuery = new Promise<QueryResult>((resolve) => {
      resolveStaleQuery = resolve
    })
    fragmentRepository.query
      .mockReturnValueOnce(staleQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    const inFlightQuery = service.query(query)
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    resolveStaleQuery(queryResult)

    await expect(inFlightQuery).resolves.toEqual(queryResult)
    await expect(service.query(query)).resolves.toEqual(updatedQueryResult)
    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('clears in-flight query requests after annotation updates', async () => {
    let resolveStaleQuery: (value: QueryResult) => void = () => undefined
    const staleQuery = new Promise<QueryResult>((resolve) => {
      resolveStaleQuery = resolve
    })
    fragmentRepository.query
      .mockReturnValueOnce(staleQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
    fragmentRepository.updateAnnotations.mockReturnValue(Promise.resolve([]))

    const inFlightQuery = service.query(query)
    await expect(service.updateAnnotations(number, [])).resolves.toEqual([])
    resolveStaleQuery(queryResult)

    await expect(inFlightQuery).resolves.toEqual(queryResult)
    await expect(service.query(query)).resolves.toEqual(updatedQueryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('does not cache stale latest query results that resolve after update', async () => {
    let resolveStaleLatestQuery: (value: QueryResult) => void = () => undefined
    const staleLatestQuery = new Promise<QueryResult>((resolve) => {
      resolveStaleLatestQuery = resolve
    })
    fragmentRepository.queryLatest
      .mockReturnValueOnce(staleLatestQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    const inFlightLatestQuery = service.queryLatest()
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    resolveStaleLatestQuery(queryResult)

    await expect(inFlightLatestQuery).resolves.toEqual(queryResult)
    await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)
    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
  })

  test('does not repopulate prefetched latest fragments from stale latest query after update', async () => {
    let resolveStaleLatestQuery: (value: QueryResult) => void = () => undefined
    const staleLatestQuery = new Promise<QueryResult>((resolve) => {
      resolveStaleLatestQuery = resolve
    })
    const staleLatestQueryResult: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }

    fragmentRepository.queryLatest
      .mockReturnValueOnce(staleLatestQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
    fragmentRepository.find.mockReturnValue(Promise.resolve(updatedFragment))
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    const inFlightLatestQuery = service.queryLatest()
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)

    resolveStaleLatestQuery(staleLatestQueryResult)

    await expect(inFlightLatestQuery).resolves.toEqual(staleLatestQueryResult)
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.find).toHaveBeenCalledWith(
      number,
      [1, 2, 3],
      false,
    )
  })

  test('evicts oldest provenance by id cache entry when max size is exceeded', async () => {
    fragmentRepository.fetchProvenance.mockImplementation((id: string) =>
      Promise.resolve({
        id: id,
        longName: id,
        abbreviation: id,
        parent: 'parent',
        sortKey: 1,
      }),
    )

    for (let index = 0; index <= 250; index += 1) {
      await service.fetchProvenance(`P.${index}`)
    }

    await service.fetchProvenance('P.0')

    expect(fragmentRepository.fetchProvenance).toHaveBeenCalledTimes(252)
  })

  test('evicts oldest provenance children cache entry when max size is exceeded', async () => {
    fragmentRepository.fetchProvenanceChildren.mockImplementation(
      (id: string) =>
        Promise.resolve([
          {
            id: `${id}.child`,
            longName: `${id}.child`,
            abbreviation: `${id}.child`,
            parent: id,
            sortKey: 1,
          },
        ]),
    )

    for (let index = 0; index <= 250; index += 1) {
      await service.fetchProvenanceChildren(`PC.${index}`)
    }

    await service.fetchProvenanceChildren('PC.0')

    expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(
      252,
    )
  })

  test('returns when trim cache finds no oldest key', () => {
    const cache = new Map<string, { expiresAt: number; value: Fragment }>()
    cache.set('K.1', { expiresAt: Date.now() + 1, value: cachedFragment })
    cache.set('K.2', { expiresAt: Date.now() + 1, value: updatedFragment })

    const emptyKeys = new Map<
      string,
      { expiresAt: number; value: Fragment }
    >().keys()
    const keysSpy = jest.spyOn(cache, 'keys').mockReturnValue(emptyKeys)

    ;(
      service as unknown as {
        trimCache: (
          cache: Map<string, { expiresAt: number; value: Fragment }>,
          maximumCacheSize: number,
        ) => void
      }
    ).trimCache(cache, 1)

    expect(cache.size).toBe(2)
    keysSpy.mockRestore()
  })
})

describe('Query by traditional references', () => {
  const fragment = fragmentFactory.build({ traditionalReferences: ['text 1'] })
  const returnData = {
    items: [
      { traditionalReference: 'text 1', fragmentNumbers: [fragment.number] },
    ],
  }
  const expected = Promise.resolve(returnData)
  let result
  beforeEach(async () => {
    fragmentRepository.queryByTraditionalReferences.mockReturnValue(
      Promise.resolve(returnData),
    )
    result = fragmentService.queryByTraditionalReferences(['text 1'])
  })
  test('returns traditional reference to fragment numbers mapping data', () =>
    expect(result).toEqual(expected))
  test('calls repository with correct parameters', () =>
    expect(
      fragmentRepository.queryByTraditionalReferences,
    ).toHaveBeenCalledWith(['text 1']))
})

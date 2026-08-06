import BibliographyService from 'bibliography/application/BibliographyService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import { defaultCacheScope } from 'fragmentarium/application/FragmentCache'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import { silenceConsoleErrors } from 'setupTests'

export const createFragmentRepository = () => ({
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
})

export const createImageRepository = () => ({
  find: jest.fn(),
  findFolio: jest.fn(),
  findPhoto: jest.fn(),
  findThumbnail: jest.fn(),
})

export type MockedFragmentRepository = ReturnType<
  typeof createFragmentRepository
>
export type MockedImageRepository = ReturnType<typeof createImageRepository>

export interface MockedBibliographyService {
  find: jest.Mock
  findMany: jest.Mock
  search: jest.Mock
}

export interface MockedWordRepository {
  searchLemma: jest.Mock
  find: jest.Mock
  findAll: jest.Mock
}

export interface FragmentServiceTestContext {
  fragmentRepository: MockedFragmentRepository
  imageRepository: MockedImageRepository
  wordRepository: MockedWordRepository
  bibliographyService: MockedBibliographyService
  fragmentService: FragmentService
  createService: (getCacheScope?: () => string) => FragmentService
}

export function createFragmentServiceTestContext(
  getCacheScope?: () => string,
): FragmentServiceTestContext {
  const fragmentRepository = createFragmentRepository()
  const imageRepository = createImageRepository()
  const wordRepository: MockedWordRepository =
    new (WordRepository as unknown as jest.Mock)()
  const bibliographyService: MockedBibliographyService =
    new (BibliographyService as unknown as jest.Mock)()
  const createService = (
    serviceCacheScope: () => string = getCacheScope ??
      (() => defaultCacheScope),
  ): FragmentService =>
    new FragmentService(
      fragmentRepository,
      imageRepository,
      wordRepository as unknown as WordRepository,
      bibliographyService as unknown as BibliographyService,
      serviceCacheScope,
    )

  return {
    fragmentRepository,
    imageRepository,
    wordRepository,
    bibliographyService,
    fragmentService: createService(),
    createService: createService,
  }
}

export function buildFragmentWithReferences(number: string): Fragment {
  const references = bibliographyEntryFactory
    .buildList(2)
    .map((entry: BibliographyEntry) =>
      referenceFactory.build({}, { associations: { document: entry } }),
    )

  return fragmentFactory.build(
    { number: number },
    { associations: { references: references, genres: new Genres([]) } },
  )
}

export function rejectBibliographyLookups(
  bibliographyService: MockedBibliographyService,
): void {
  bibliographyService.find.mockImplementation((id: string) =>
    Promise.reject(new Error(`${id} not found.`)),
  )
  bibliographyService.findMany.mockImplementation((ids: string[]) =>
    Promise.reject(new Error(`${ids} not found.`)),
  )
  silenceConsoleErrors()
}

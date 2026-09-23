import BibliographyService from 'bibliography/application/BibliographyService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentService from 'fragmentarium/application/FragmentService'

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

export const fragmentRepository = {
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
  updateNamedEntityAnnotations: jest.fn(),
}

export const imageRepository = {
  find: jest.fn(),
  findFolio: jest.fn(),
  findPhoto: jest.fn(),
  findThumbnail: jest.fn(),
}

export const bibliographyService = new (BibliographyService as jest.Mock)()
export const wordRepository = new (WordRepository as jest.Mock)()

export function createFragmentService(
  getCacheScope?: () => string,
): FragmentService {
  return new FragmentService(
    fragmentRepository,
    imageRepository,
    wordRepository,
    bibliographyService,
    getCacheScope,
  )
}

export const fragmentService = createFragmentService()

export const resultStub = {}
export const cacheTtlMilliseconds = 5 * 60 * 1000

export async function withExpiredCacheTimestamp(
  runTest: (expireCache: () => void) => PromiseLike<void> | void,
): Promise<void> {
  let currentTime = 0
  const dateNow = jest.spyOn(Date, 'now').mockImplementation(() => currentTime)
  const expireCache = (): void => {
    currentTime = cacheTtlMilliseconds + 1
  }

  try {
    await runTest(expireCache)
  } finally {
    dateNow.mockRestore()
  }
}

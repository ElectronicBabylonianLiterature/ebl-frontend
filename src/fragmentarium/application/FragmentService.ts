import Reference from 'bibliography/domain/Reference'
import DictionaryWord from 'dictionary/domain/Word'
import Annotation from 'fragmentarium/domain/annotation'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
  LemmatizationDto,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import { Genres } from 'fragmentarium/domain/Genres'
import LemmatizationFactory from './LemmatizationFactory'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { produce, castDraft } from 'immer'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { FragmentQuery } from 'query/FragmentQuery'
import { FragmentAfoRegisterQueryResult, QueryResult } from 'query/QueryResult'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Colophon } from 'fragmentarium/domain/Colophon'
import {
  LemmaSuggestions,
  LineLemmaAnnotations,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import {
  ProvenanceRecord,
  sanitizeProvenanceRecord,
  sortProvenances,
} from 'fragmentarium/domain/Provenance'
import {
  setProvenanceRecords,
  upsertProvenanceRecord,
} from 'corpus/domain/provenance'
import { stringify } from 'query-string'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import { CacheEntry, setCachedValue, trimCache } from 'common/utils/cache'
import getOrFetchCachedValue from 'common/utils/getOrFetchCachedValue'

const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
const maximumCachedFragments = 250
const maximumCachedThumbnails = 250
const maximumCachedProvenanceRecords = 250
const maximumCachedProvenanceChildren = 250
const maximumCachedQueryResults = 250
const fragmentFetchConcurrencyLimit = 6
const thumbnailFetchConcurrencyLimit = 8
const latestQueryCacheKey = 'latest:'
const provenanceCacheKey = 'provenance:'
const defaultCacheScope = 'default'

type QueryItemWithPrefetchedFragment = QueryResult['items'][number]

export type ThumbnailSize = 'small' | 'medium' | 'large'

export const onError = (error) => {
  if (error.message === '403 Forbidden') {
    throw new Error("You don't have permissions to view this fragment.")
  } else {
    throw error
  }
}

export interface ThumbnailBlob {
  readonly blob: Blob | null
}

export interface ImageRepository {
  find(fileName: string): Promise<Blob>
  findFolio(folio: Folio, signal?: AbortSignal): Promise<Blob>
  findPhoto(number: string, signal?: AbortSignal): Promise<Blob>
  findThumbnail(number: string, size: ThumbnailSize): Promise<ThumbnailBlob>
}

export const editionFields = [
  'transliteration',
  'notes',
  'introduction',
] as const

export type EditionFields = {
  [K in (typeof editionFields)[number]]: string | null
}

export interface FragmentRepository {
  statistics(signal?: AbortSignal): Promise<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }>
  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Promise<Fragment>
  findInCorpus(
    number: string,
    signal?: AbortSignal,
  ): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }>
  fetchGenres(signal?: AbortSignal): Promise<string[][]>
  fetchProvenances(): Promise<readonly ProvenanceRecord[]>
  fetchProvenance(id: string): Promise<ProvenanceRecord>
  fetchProvenanceChildren(id: string): Promise<readonly ProvenanceRecord[]>
  fetchPeriods(signal?: AbortSignal): Promise<string[]>
  fetchColophonNames(query: string): Promise<string[]>
  updateGenres(
    number: string,
    genres: Genres,
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateScopes(
    number: string,
    scopes: string[],
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateScript(
    number: string,
    script: Script,
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateDatesInText(
    number: string,
    date: MesopotamianDateDto[],
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateEdition(
    number: string,
    updates: EditionFields,
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment>
  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>,
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
    signal?: AbortSignal,
  ): Promise<Fragment>
  updateColophon(
    number: string,
    colophon: Colophon,
    signal?: AbortSignal,
  ): Promise<Fragment>
  folioPager(folio: Folio, fragmentNumber: string): Promise<FolioPagerData>
  fragmentPager(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FragmentPagerData>
  findLemmas(lemma: string, isNormalized: boolean): Promise<Word[][]>
  lineToVecRanking(
    number: string,
    signal?: AbortSignal,
  ): Promise<LineToVecRanking>
  query(fragmentQuery: FragmentQuery): Promise<QueryResult>
  queryLatest(): Promise<QueryResult>
  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Promise<FragmentAfoRegisterQueryResult>
  listAllFragments(): Promise<string[]>
  collectLemmaSuggestions(number: string): Promise<LemmaSuggestions>
  fetchNamedEntityAnnotations(
    number: string,
  ): Promise<readonly ApiEntityAnnotationSpan[]>
  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
  ): Promise<Fragment>
}

export interface AnnotationRepository {
  findAnnotations(
    number: string,
    generateAnnotations: boolean,
  ): Promise<readonly Annotation[]>
  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]>
}
export class FragmentService {
  private readonly referenceInjector: ReferenceInjector
  private cacheScope: string | null = null
  private cacheGeneration = 0
  private readonly cachedProvenances = new Map<
    string,
    CacheEntry<readonly ProvenanceRecord[]>
  >()
  private readonly cachedProvenanceRequests = new Map<
    string,
    Promise<readonly ProvenanceRecord[]>
  >()
  private readonly cachedProvenanceById = new Map<
    string,
    CacheEntry<ProvenanceRecord>
  >()
  private readonly cachedProvenanceByIdRequest = new Map<
    string,
    Promise<ProvenanceRecord>
  >()
  private readonly cachedProvenanceChildrenById = new Map<
    string,
    CacheEntry<readonly ProvenanceRecord[]>
  >()
  private readonly cachedProvenanceChildrenByIdRequest = new Map<
    string,
    Promise<readonly ProvenanceRecord[]>
  >()
  private readonly cachedFragments = new Map<string, CacheEntry<Fragment>>()
  private readonly cachedFragmentRequests = new Map<string, Promise<Fragment>>()
  private readonly cachedQueryResults = new Map<
    string,
    CacheEntry<QueryResult>
  >()
  private readonly cachedQueryResultRequests = new Map<
    string,
    Promise<QueryResult>
  >()
  private readonly prefetchedFragmentsByCacheKey = new Map<string, Fragment>()
  private readonly fragmentFetchLimiter = new ConcurrencyLimiter(
    fragmentFetchConcurrencyLimit,
  )
  private readonly thumbnailFetchLimiter = new ConcurrencyLimiter(
    thumbnailFetchConcurrencyLimit,
  )
  private readonly cachedThumbnails = new Map<
    string,
    CacheEntry<ThumbnailBlob>
  >()
  private readonly cachedThumbnailRequests = new Map<
    string,
    Promise<ThumbnailBlob>
  >()

  constructor(
    private readonly fragmentRepository: FragmentRepository &
      AnnotationRepository,
    private readonly imageRepository: ImageRepository,
    private readonly wordRepository: WordRepository,
    private readonly bibliographyService: BibliographyService,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  statistics(signal?: AbortSignal): Promise<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }> {
    return this.fragmentRepository.statistics(signal)
  }

  lineToVecRanking(
    number: string,
    signal?: AbortSignal,
  ): Promise<LineToVecRanking> {
    return this.fragmentRepository.lineToVecRanking(number, signal)
  }

  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Promise<Fragment> {
    const cacheKey = this.createFragmentCacheKey(number, lines, excludeLines)
    return this.getOrFetchCachedValue(
      this.cachedFragments,
      this.cachedFragmentRequests,
      cacheKey,
      maximumCachedFragments,
      () =>
        this.fragmentFetchLimiter.run(() =>
          this.findAndInjectFragment(number, lines, excludeLines, cacheKey),
        ),
    )
  }

  isInFragmentarium(number: string): boolean {
    try {
      this.fragmentRepository.find(number)
      return true
    } catch {
      return false
    }
  }

  updateGenres(
    number: string,
    genres: Genres,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateGenres(number, genres, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateScript(
    number: string,
    script: Script,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateScript(number, script, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }
  updateScopes(
    number: string,
    scopes: string[],
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateScopes(number, scopes, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateDate(number, date, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateDatesInText(
    number: string,
    datesInText: MesopotamianDateDto[],
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateDatesInText(number, datesInText, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  fetchGenres(signal?: AbortSignal): Promise<string[][]> {
    return this.fragmentRepository.fetchGenres(signal)
  }

  fetchProvenances(): Promise<readonly ProvenanceRecord[]> {
    return this.getOrFetchCachedValue(
      this.cachedProvenances,
      this.cachedProvenanceRequests,
      provenanceCacheKey,
      1,
      () =>
        this.fragmentRepository.fetchProvenances().then((provenances) => {
          const sanitized = provenances.map(sanitizeProvenanceRecord)
          setProvenanceRecords(sanitized)
          sanitized.forEach((provenance) => {
            setCachedValue({
              cache: this.cachedProvenanceById,
              key: provenance.id,
              value: provenance,
              maximumCacheSize: maximumCachedProvenanceRecords,
              cacheEntryLifetimeInMilliseconds,
            })
          })
          return sanitized
        }),
    )
  }

  fetchProvenance(id: string): Promise<ProvenanceRecord> {
    return this.getOrFetchCachedValue(
      this.cachedProvenanceById,
      this.cachedProvenanceByIdRequest,
      id,
      maximumCachedProvenanceRecords,
      () =>
        this.fragmentRepository.fetchProvenance(id).then((provenance) => {
          const sanitized = sanitizeProvenanceRecord(provenance)
          upsertProvenanceRecord(sanitized)
          return sanitized
        }),
    )
  }

  fetchProvenanceChildren(id: string): Promise<readonly ProvenanceRecord[]> {
    return this.getOrFetchCachedValue(
      this.cachedProvenanceChildrenById,
      this.cachedProvenanceChildrenByIdRequest,
      id,
      maximumCachedProvenanceChildren,
      () =>
        this.fragmentRepository.fetchProvenanceChildren(id).then((children) => {
          const sanitized = children.map(sanitizeProvenanceRecord)
          const sorted = sortProvenances(sanitized)
          sorted.forEach((provenance) => {
            upsertProvenanceRecord(provenance)
            setCachedValue({
              cache: this.cachedProvenanceById,
              key: provenance.id,
              value: provenance,
              maximumCacheSize: maximumCachedProvenanceRecords,
              cacheEntryLifetimeInMilliseconds,
            })
          })
          return sorted
        }),
    )
  }

  fetchPeriods(signal?: AbortSignal): Promise<string[]> {
    return this.fragmentRepository.fetchPeriods(signal)
  }

  fetchColophonNames(query: string): Promise<string[]> {
    return this.fragmentRepository.fetchColophonNames(query)
  }

  listAllFragments(): Promise<string[]> {
    return this.fragmentRepository.listAllFragments()
  }

  updateEdition(
    number: string,
    updates: EditionFields,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateEdition(number, updates, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateLemmatization(number, lemmatization)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateLemmaAnnotation(number, annotations, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateReferences(number, references, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateArchaeology(number, archaeology, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  updateColophon(
    number: string,
    colophon: Colophon,
    signal?: AbortSignal,
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateColophon(number, colophon, signal)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  findInCorpus(
    number: string,
    signal?: AbortSignal,
  ): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }> {
    return this.fragmentRepository.findInCorpus(number, signal)
  }

  findFolio(folio: Folio, signal?: AbortSignal): Promise<Blob> {
    return this.imageRepository.findFolio(folio, signal)
  }

  findImage(fileName: string): Promise<Blob> {
    return this.imageRepository.find(fileName)
  }

  findPhoto(fragment: Fragment, signal?: AbortSignal): Promise<Blob> {
    if (fragment.hasPhoto) {
      return this.imageRepository.findPhoto(fragment.number, signal)
    } else {
      throw Error(`Fragment ${fragment.number} doesn't have a Photo`)
    }
  }

  findThumbnail(
    fragment: Fragment,
    size: ThumbnailSize,
  ): Promise<ThumbnailBlob> {
    const cacheKey = this.createThumbnailCacheKey(fragment.number, size)
    return this.getOrFetchCachedValue(
      this.cachedThumbnails,
      this.cachedThumbnailRequests,
      cacheKey,
      maximumCachedThumbnails,
      () =>
        this.thumbnailFetchLimiter.run(() =>
          this.imageRepository.findThumbnail(fragment.number, size),
        ),
    )
  }

  folioPager(folio: Folio, fragmentNumber: string): Promise<FolioPagerData> {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
  }

  fragmentPager(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FragmentPagerData> {
    return this.fragmentRepository.fragmentPager(fragmentNumber, signal)
  }

  searchLemma(lemma: string): Promise<readonly Word[]> {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  searchBibliography(query: string): Promise<readonly BibliographyEntry[]> {
    return this.bibliographyService.search(query)
  }

  findAnnotations(number: string): Promise<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, false)
  }
  generateAnnotations(number: string): Promise<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, true)
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]> {
    return this.fragmentRepository
      .updateAnnotations(number, annotations)
      .then((updatedAnnotations) => {
        this.clearCachedFragments(number)
        this.clearCachedQueryResults()
        return updatedAnnotations
      })
  }

  createLemmatization(text: Text): Promise<Lemmatization> {
    return new LemmatizationFactory(
      this,
      this.wordRepository,
    ).createLemmatization(text)
  }

  findSuggestions(
    value: string,
    isNormalized: boolean,
  ): Promise<ReadonlyArray<UniqueLemma>> {
    return this.fragmentRepository
      .findLemmas(value, isNormalized)
      .then((lemmas: DictionaryWord[][]) =>
        lemmas.map((complexLemma: DictionaryWord[]) =>
          complexLemma.map((word: DictionaryWord) => new Lemma(word)),
        ),
      )
  }

  query(fragmentQuery: FragmentQuery): Promise<QueryResult> {
    const cacheKey = this.createQueryCacheKey(fragmentQuery)
    const queryResultRequest = this.getOrFetchCachedValue(
      this.cachedQueryResults,
      this.cachedQueryResultRequests,
      cacheKey,
      maximumCachedQueryResults,
      () => this.fragmentRepository.query(fragmentQuery),
    )
    const queryGeneration = this.cacheGeneration

    return queryResultRequest.then((queryResult) => {
      if (queryGeneration === this.cacheGeneration) {
        this.storePrefetchedFragments(queryResult)
      }
      return queryResult
    })
  }

  queryLatest(): Promise<QueryResult> {
    const queryResultRequest = this.getOrFetchCachedValue(
      this.cachedQueryResults,
      this.cachedQueryResultRequests,
      latestQueryCacheKey,
      maximumCachedQueryResults,
      () => this.fragmentRepository.queryLatest(),
    )
    const queryGeneration = this.cacheGeneration

    return queryResultRequest.then((queryResult) => {
      if (queryGeneration === this.cacheGeneration) {
        this.storePrefetchedFragments(queryResult)
      }
      return queryResult
    })
  }

  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Promise<FragmentAfoRegisterQueryResult> {
    return this.fragmentRepository.queryByTraditionalReferences(
      traditionalReferences,
    )
  }

  collectLemmaSuggestions(number: string): Promise<LemmaSuggestions> {
    return this.fragmentRepository.collectLemmaSuggestions(number)
  }

  private findAndInjectFragment(
    number: string,
    lines: readonly number[] | undefined,
    excludeLines: boolean | undefined,
    cacheKey: string,
  ): Promise<Fragment> {
    const prefetchedFragment = this.takePrefetchedFragment(cacheKey)

    if (prefetchedFragment) {
      return this.injectReferences(prefetchedFragment).catch(onError)
    }

    return this.fragmentRepository
      .find(number, lines, excludeLines)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .catch(onError)
  }

  private storePrefetchedFragments(queryResult: QueryResult): void {
    this.prefetchedFragmentsByCacheKey.clear()

    queryResult.items.forEach((queryItem) => {
      const prefetchedFragment = this.readPrefetchedFragment(queryItem)

      if (!prefetchedFragment) {
        return
      }

      const lines = _.take(queryItem.matchingLines, 3)
      const excludeLines = _.isEmpty(queryItem.matchingLines)

      this.prefetchedFragmentsByCacheKey.set(
        this.createFragmentCacheKey(
          queryItem.museumNumber,
          lines,
          excludeLines,
        ),
        prefetchedFragment,
      )
      this.prefetchedFragmentsByCacheKey.set(
        this.createFragmentCacheKey(queryItem.museumNumber),
        prefetchedFragment,
      )
    })
  }

  private readPrefetchedFragment(
    queryItem: QueryItemWithPrefetchedFragment,
  ): Fragment | null {
    return queryItem.fragment ?? null
  }

  private takePrefetchedFragment(cacheKey: string): Fragment | null {
    const prefetchedFragment = this.prefetchedFragmentsByCacheKey.get(cacheKey)

    if (!prefetchedFragment) {
      return null
    }

    this.prefetchedFragmentsByCacheKey.delete(cacheKey)
    return prefetchedFragment
  }

  private injectReferences(fragment: Fragment): Promise<Fragment> {
    return this.referenceInjector
      .injectReferencesToText(fragment.text)
      .then((text) =>
        produce(fragment, (draft) => {
          draft.text = castDraft(text)
        }),
      )
      .then((fragment) =>
        Promise.all([
          this.referenceInjector.injectReferencesToIntroduction(
            fragment.introduction,
          ),
          this.referenceInjector.injectReferencesToNotes(fragment.notes),
        ]).then(([introduction, notes]) =>
          produce(fragment, (draft) => {
            draft.introduction = castDraft(introduction)
            draft.notes = castDraft(notes)
          }),
        ),
      )
  }

  fetchNamedEntityAnnotations(
    number: string,
  ): Promise<readonly ApiEntityAnnotationSpan[]> {
    return this.fragmentRepository.fetchNamedEntityAnnotations(number)
  }
  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateNamedEntityAnnotations(number, annotations)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cacheUpdatedFragment(fragment))
  }

  private getOrFetchCachedValue<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    requests: Map<CacheKey, Promise<CacheValue>>,
    key: CacheKey,
    maximumCacheSize: number,
    fetchValue: () => Promise<CacheValue>,
  ): Promise<CacheValue> {
    this.clearCachesWhenScopeChanges()
    return getOrFetchCachedValue({
      cache,
      requests,
      key,
      maximumCacheSize,
      cacheEntryLifetimeInMilliseconds,
      fetchValue,
    })
  }

  private trimCache<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    maximumCacheSize: number,
  ): void {
    trimCache(cache, maximumCacheSize)
  }

  private cacheUpdatedFragment(fragment: Fragment): Fragment {
    this.clearCachesWhenScopeChanges()
    this.clearCachedFragments(fragment.number)
    this.clearCachedQueryResults()
    setCachedValue({
      cache: this.cachedFragments,
      key: this.createFragmentCacheKey(fragment.number),
      value: fragment,
      maximumCacheSize: maximumCachedFragments,
      cacheEntryLifetimeInMilliseconds,
    })
    return fragment
  }

  private clearCachedFragments(number: string): void {
    const cacheKeyPrefix = this.createFragmentCacheKeyPrefix(number)
    for (const cacheKey of this.cachedFragments.keys()) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        this.cachedFragments.delete(cacheKey)
      }
    }
    for (const cacheKey of this.cachedFragmentRequests.keys()) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        this.cachedFragmentRequests.delete(cacheKey)
      }
    }
  }

  private clearCachedQueryResults(): void {
    this.cachedQueryResults.clear()
    this.cachedQueryResultRequests.clear()
    this.prefetchedFragmentsByCacheKey.clear()
    this.cacheGeneration += 1
  }

  private clearAllCaches(): void {
    this.cachedProvenances.clear()
    this.cachedProvenanceRequests.clear()
    this.cachedProvenanceById.clear()
    this.cachedProvenanceByIdRequest.clear()
    this.cachedProvenanceChildrenById.clear()
    this.cachedProvenanceChildrenByIdRequest.clear()
    this.cachedFragments.clear()
    this.cachedFragmentRequests.clear()
    this.cachedQueryResults.clear()
    this.cachedQueryResultRequests.clear()
    this.prefetchedFragmentsByCacheKey.clear()
    this.cachedThumbnails.clear()
    this.cachedThumbnailRequests.clear()
    this.cacheGeneration += 1
  }

  private clearCachesWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()
    if (this.cacheScope === null) {
      this.cacheScope = nextScope
      return
    }
    if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.clearAllCaches()
    }
  }

  private resolveCacheScope(): string {
    try {
      return this.getCacheScope()
    } catch {
      return defaultCacheScope
    }
  }

  private createFragmentCacheKey(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): string {
    return `${this.createFragmentCacheKeyPrefix(number)}${(lines ?? []).join(
      ',',
    )}:${excludeLines === true}`
  }

  private createFragmentCacheKeyPrefix(number: string): string {
    return `${number.length}:${number}:`
  }

  private createQueryCacheKey(fragmentQuery: FragmentQuery): string {
    return `query:${stringify(fragmentQuery)}`
  }

  private createThumbnailCacheKey(number: string, size: ThumbnailSize): string {
    return `${number.length}:${number}:${size}`
  }
}

export default FragmentService

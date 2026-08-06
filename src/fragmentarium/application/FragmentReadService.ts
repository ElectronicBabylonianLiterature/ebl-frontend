import Annotation from 'fragmentarium/domain/annotation'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import Lemmatization, {
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { FragmentQuery } from 'query/FragmentQuery'
import { FragmentAfoRegisterQueryResult, QueryResult } from 'query/QueryResult'
import { LemmaSuggestions } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import FragmentCache, {
  defaultCacheScope,
} from 'fragmentarium/application/FragmentCache'
import FragmentProvenanceLoader from 'fragmentarium/application/FragmentProvenanceLoader'
import FragmentImageLoader from 'fragmentarium/application/FragmentImageLoader'
import FragmentWriter from 'fragmentarium/application/FragmentWriter'
import FragmentQueryLoader from 'fragmentarium/application/FragmentQueryLoader'
import FragmentLemmaLoader from 'fragmentarium/application/FragmentLemmaLoader'
import {
  AnnotationRepository,
  FragmentRepository,
  ImageRepository,
  ThumbnailBlob,
  ThumbnailSize,
} from 'fragmentarium/application/FragmentRepositoryTypes'

export * from 'fragmentarium/application/FragmentRepositoryTypes'

export class FragmentReadService {
  protected readonly referenceInjector: ReferenceInjector
  protected readonly cache: FragmentCache
  protected readonly provenanceLoader: FragmentProvenanceLoader
  protected readonly imageLoader: FragmentImageLoader
  protected readonly writer: FragmentWriter
  protected readonly queryLoader: FragmentQueryLoader
  protected readonly lemmaLoader: FragmentLemmaLoader

  constructor(
    protected readonly fragmentRepository: FragmentRepository &
      AnnotationRepository,
    protected readonly imageRepository: ImageRepository,
    protected readonly wordRepository: WordRepository,
    protected readonly bibliographyService: BibliographyService,
    getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
    this.cache = new FragmentCache(getCacheScope)
    this.provenanceLoader = new FragmentProvenanceLoader(
      fragmentRepository,
      this.cache,
    )
    this.imageLoader = new FragmentImageLoader(imageRepository, this.cache)
    this.writer = new FragmentWriter(
      fragmentRepository,
      this.referenceInjector,
      this.cache,
    )
    this.queryLoader = new FragmentQueryLoader(
      fragmentRepository,
      this.referenceInjector,
      this.cache,
    )
    this.lemmaLoader = new FragmentLemmaLoader(
      fragmentRepository,
      wordRepository,
      this,
    )
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
    return this.queryLoader.find(number, lines, excludeLines)
  }

  query(fragmentQuery: FragmentQuery): Promise<QueryResult> {
    return this.queryLoader.query(fragmentQuery)
  }

  queryLatest(): Promise<QueryResult> {
    return this.queryLoader.queryLatest()
  }

  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Promise<FragmentAfoRegisterQueryResult> {
    return this.queryLoader.queryByTraditionalReferences(traditionalReferences)
  }

  isInFragmentarium(number: string): boolean {
    try {
      this.fragmentRepository.find(number)
      return true
    } catch {
      return false
    }
  }

  fetchProvenances(): Promise<readonly ProvenanceRecord[]> {
    return this.provenanceLoader.fetchProvenances()
  }

  fetchProvenance(id: string): Promise<ProvenanceRecord> {
    return this.provenanceLoader.fetchProvenance(id)
  }

  fetchProvenanceChildren(id: string): Promise<readonly ProvenanceRecord[]> {
    return this.provenanceLoader.fetchProvenanceChildren(id)
  }

  findFolio(folio: Folio, signal?: AbortSignal): Promise<Blob> {
    return this.imageLoader.findFolio(folio, signal)
  }

  findImage(fileName: string): Promise<Blob> {
    return this.imageLoader.findImage(fileName)
  }

  findPhoto(fragment: Fragment, signal?: AbortSignal): Promise<Blob> {
    return this.imageLoader.findPhoto(fragment, signal)
  }

  findThumbnail(
    fragment: Fragment,
    size: ThumbnailSize,
  ): Promise<ThumbnailBlob> {
    return this.imageLoader.findThumbnail(fragment, size)
  }

  fetchGenres(signal?: AbortSignal): Promise<string[][]> {
    return this.fragmentRepository.fetchGenres(signal)
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

  findInCorpus(
    number: string,
    signal?: AbortSignal,
  ): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }> {
    return this.fragmentRepository.findInCorpus(number, signal)
  }

  folioPager(
    folio: Folio,
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FolioPagerData> {
    return this.fragmentRepository.folioPager(folio, fragmentNumber, signal)
  }

  fragmentPager(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FragmentPagerData> {
    return this.fragmentRepository.fragmentPager(fragmentNumber, signal)
  }

  searchLemma(lemma: string): Promise<readonly Word[]> {
    return this.lemmaLoader.searchLemma(lemma)
  }

  createLemmatization(text: Text): Promise<Lemmatization> {
    return this.lemmaLoader.createLemmatization(text)
  }

  findSuggestions(
    value: string,
    isNormalized: boolean,
  ): Promise<ReadonlyArray<UniqueLemma>> {
    return this.lemmaLoader.findSuggestions(value, isNormalized)
  }

  collectLemmaSuggestions(number: string): Promise<LemmaSuggestions> {
    return this.lemmaLoader.collectLemmaSuggestions(number)
  }

  searchBibliography(query: string): Promise<readonly BibliographyEntry[]> {
    return this.bibliographyService.search(query)
  }

  findAnnotations(
    number: string,
    signal?: AbortSignal,
  ): Promise<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, false, signal)
  }

  generateAnnotations(number: string): Promise<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, true)
  }

  fetchNamedEntityAnnotations(
    number: string,
    signal?: AbortSignal,
  ): Promise<readonly ApiEntityAnnotationSpan[]> {
    return this.fragmentRepository.fetchNamedEntityAnnotations(number, signal)
  }
}

export default FragmentReadService

import DictionaryWord from 'dictionary/domain/Word'
import Annotation from 'fragmentarium/domain/annotation'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import LemmatizationFactory from './LemmatizationFactory'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { FragmentQuery } from 'query/FragmentQuery'
import { FragmentAfoRegisterQueryResult, QueryResult } from 'query/QueryResult'
import { LemmaSuggestions } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  onError,
  ThumbnailBlob,
  ThumbnailSize,
} from 'fragmentarium/application/fragmentServicePorts'
import {
  fragmentKey,
  latestQueryCacheKey,
  queryKey,
  thumbnailKey,
} from 'fragmentarium/application/fragmentCacheKeys'
import {
  fetchProvenance,
  fetchProvenanceChildren,
  fetchProvenances,
} from 'fragmentarium/application/fragmentProvenance'
import { FragmentServiceBase } from 'fragmentarium/application/fragmentServiceBase'
import { prefetchFrom } from 'fragmentarium/application/fragmentPrefetch'

export * from 'fragmentarium/application/fragmentServicePorts'

export class FragmentService extends FragmentServiceBase {
  statistics(): Promise<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }> {
    return this.fragmentRepository.statistics()
  }

  lineToVecRanking(number: string): Promise<LineToVecRanking> {
    return this.fragmentRepository.lineToVecRanking(number)
  }

  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Promise<Fragment> {
    const cacheKey = fragmentKey(number, lines, excludeLines)
    return this.cache.fragment(cacheKey, () =>
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

  fetchGenres(signal?: AbortSignal): Promise<string[][]> {
    return this.fragmentRepository.fetchGenres(signal)
  }

  fetchProvenances(): Promise<readonly ProvenanceRecord[]> {
    return fetchProvenances(this.fragmentRepository, this.cache)
  }

  fetchProvenance(id: string): Promise<ProvenanceRecord> {
    return fetchProvenance(this.fragmentRepository, this.cache, id)
  }

  fetchProvenanceChildren(id: string): Promise<readonly ProvenanceRecord[]> {
    return fetchProvenanceChildren(this.fragmentRepository, this.cache, id)
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

  findInCorpus(number: string): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }> {
    return this.fragmentRepository.findInCorpus(number)
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
    return this.cache.thumbnail(thumbnailKey(fragment.number, size), () =>
      this.thumbnailFetchLimiter.run(() =>
        this.imageRepository.findThumbnail(fragment.number, size),
      ),
    )
  }

  folioPager(
    folio: Folio,
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FolioPagerData> {
    return this.fragmentRepository.folioPager(folio, fragmentNumber, signal)
  }

  fragmentPager(fragmentNumber: string): Promise<FragmentPagerData> {
    return this.fragmentRepository.fragmentPager(fragmentNumber)
  }

  searchLemma(lemma: string): Promise<readonly Word[]> {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
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
    return this.prefetchFrom(
      this.cache.queryResult(queryKey(fragmentQuery), () =>
        this.fragmentRepository.query(fragmentQuery),
      ),
    )
  }

  queryLatest(): Promise<QueryResult> {
    return this.prefetchFrom(
      this.cache.queryResult(latestQueryCacheKey, () =>
        this.fragmentRepository.queryLatest(),
      ),
    )
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

  private prefetchFrom(
    queryResultRequest: Promise<QueryResult>,
  ): Promise<QueryResult> {
    return prefetchFrom(this.cache, queryResultRequest)
  }

  private findAndInjectFragment(
    number: string,
    lines: readonly number[] | undefined,
    excludeLines: boolean | undefined,
    cacheKey: string,
  ): Promise<Fragment> {
    const prefetchedFragment = this.cache.takePrefetchedFragment(cacheKey)

    if (prefetchedFragment) {
      return this.injectReferences(prefetchedFragment).catch(onError)
    }

    return this.fragmentRepository
      .find(number, lines, excludeLines)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .catch(onError)
  }
}

export default FragmentService

import Bluebird from 'bluebird'
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

export * from 'fragmentarium/application/fragmentServicePorts'

export class FragmentService extends FragmentServiceBase {
  statistics(): Bluebird<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }> {
    return this.fragmentRepository.statistics()
  }

  lineToVecRanking(number: string): Bluebird<LineToVecRanking> {
    return this.fragmentRepository.lineToVecRanking(number)
  }

  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Bluebird<Fragment> {
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

  fetchGenres(): Bluebird<string[][]> {
    return this.fragmentRepository.fetchGenres()
  }

  fetchProvenances(): Bluebird<readonly ProvenanceRecord[]> {
    return fetchProvenances(this.fragmentRepository, this.cache)
  }

  fetchProvenance(id: string): Bluebird<ProvenanceRecord> {
    return fetchProvenance(this.fragmentRepository, this.cache, id)
  }

  fetchProvenanceChildren(id: string): Bluebird<readonly ProvenanceRecord[]> {
    return fetchProvenanceChildren(this.fragmentRepository, this.cache, id)
  }

  fetchPeriods(): Bluebird<string[]> {
    return this.fragmentRepository.fetchPeriods()
  }

  fetchColophonNames(query: string): Bluebird<string[]> {
    return this.fragmentRepository.fetchColophonNames(query)
  }

  listAllFragments(): Bluebird<string[]> {
    return this.fragmentRepository.listAllFragments()
  }

  findInCorpus(number: string): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }> {
    return this.fragmentRepository.findInCorpus(number)
  }

  findFolio(folio: Folio): Bluebird<Blob> {
    return this.imageRepository.findFolio(folio)
  }

  findImage(fileName: string): Bluebird<Blob> {
    return this.imageRepository.find(fileName)
  }

  findPhoto(fragment: Fragment): Bluebird<Blob> {
    if (fragment.hasPhoto) {
      return this.imageRepository.findPhoto(fragment.number)
    } else {
      throw Error(`Fragment ${fragment.number} doesn't have a Photo`)
    }
  }

  findThumbnail(
    fragment: Fragment,
    size: ThumbnailSize,
  ): Bluebird<ThumbnailBlob> {
    return this.cache.thumbnail(thumbnailKey(fragment.number, size), () =>
      this.thumbnailFetchLimiter.run(() =>
        this.imageRepository.findThumbnail(fragment.number, size),
      ),
    )
  }

  folioPager(folio: Folio, fragmentNumber: string): Bluebird<FolioPagerData> {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
  }

  fragmentPager(fragmentNumber: string): Bluebird<FragmentPagerData> {
    return this.fragmentRepository.fragmentPager(fragmentNumber)
  }

  searchLemma(lemma: string): Bluebird<readonly Word[]> {
    return _.isEmpty(lemma)
      ? Bluebird.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  searchBibliography(query: string): Bluebird<readonly BibliographyEntry[]> {
    return this.bibliographyService.search(query)
  }

  findAnnotations(number: string): Bluebird<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, false)
  }

  generateAnnotations(number: string): Bluebird<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, true)
  }

  createLemmatization(text: Text): Bluebird<Lemmatization> {
    return new LemmatizationFactory(
      this,
      this.wordRepository,
    ).createLemmatization(text)
  }

  findSuggestions(
    value: string,
    isNormalized: boolean,
  ): Bluebird<ReadonlyArray<UniqueLemma>> {
    return this.fragmentRepository
      .findLemmas(value, isNormalized)
      .then((lemmas: DictionaryWord[][]) =>
        lemmas.map((complexLemma: DictionaryWord[]) =>
          complexLemma.map((word: DictionaryWord) => new Lemma(word)),
        ),
      )
  }

  query(fragmentQuery: FragmentQuery): Bluebird<QueryResult> {
    return this.prefetchFrom(
      this.cache.queryResult(queryKey(fragmentQuery), () =>
        this.fragmentRepository.query(fragmentQuery),
      ),
    )
  }

  queryLatest(): Bluebird<QueryResult> {
    return this.prefetchFrom(
      this.cache.queryResult(latestQueryCacheKey, () =>
        this.fragmentRepository.queryLatest(),
      ),
    )
  }

  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Bluebird<FragmentAfoRegisterQueryResult> {
    return this.fragmentRepository.queryByTraditionalReferences(
      traditionalReferences,
    )
  }

  collectLemmaSuggestions(number: string): Bluebird<LemmaSuggestions> {
    return this.fragmentRepository.collectLemmaSuggestions(number)
  }

  private prefetchFrom(
    queryResultRequest: Bluebird<QueryResult>,
  ): Bluebird<QueryResult> {
    const queryGeneration = this.cache.currentGeneration

    return queryResultRequest.then((queryResult) => {
      if (queryGeneration === this.cache.currentGeneration) {
        this.cache.storePrefetchedFragments(queryResult)
      }
      return queryResult
    })
  }

  private findAndInjectFragment(
    number: string,
    lines: readonly number[] | undefined,
    excludeLines: boolean | undefined,
    cacheKey: string,
  ): Bluebird<Fragment> {
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

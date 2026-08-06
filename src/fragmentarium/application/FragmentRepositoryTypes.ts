import Reference from 'bibliography/domain/Reference'
import Annotation from 'fragmentarium/domain/annotation'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
import { Genres } from 'fragmentarium/domain/Genres'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'
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
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

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
  updateGenres(number: string, genres: Genres): Promise<Fragment>
  updateScopes(number: string, scopes: string[]): Promise<Fragment>
  updateScript(number: string, script: Script): Promise<Fragment>
  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
  ): Promise<Fragment>
  updateDatesInText(
    number: string,
    date: MesopotamianDateDto[],
  ): Promise<Fragment>
  updateEdition(number: string, updates: EditionFields): Promise<Fragment>
  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment>
  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Promise<Fragment>
  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>,
  ): Promise<Fragment>
  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Promise<Fragment>
  updateColophon(number: string, colophon: Colophon): Promise<Fragment>
  folioPager(
    folio: Folio,
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FolioPagerData>
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
    signal?: AbortSignal,
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
    signal?: AbortSignal,
  ): Promise<readonly Annotation[]>
  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]>
}

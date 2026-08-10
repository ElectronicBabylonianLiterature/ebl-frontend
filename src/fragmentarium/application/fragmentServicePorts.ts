import Reference from 'bibliography/domain/Reference'
import Bluebird from 'bluebird'
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
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { ThumbnailSize } from 'fragmentarium/domain/media'

export type { ThumbnailSize }

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
  find(fileName: string): Bluebird<Blob>
  findFolio(folio: Folio): Bluebird<Blob>
  findPhoto(number: string): Bluebird<Blob>
  findThumbnail(number: string, size: ThumbnailSize): Bluebird<ThumbnailBlob>
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
  statistics(): Bluebird<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }>
  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Bluebird<Fragment>
  findInCorpus(number: string): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }>
  fetchGenres(): Bluebird<string[][]>
  fetchProvenances(): Bluebird<readonly ProvenanceRecord[]>
  fetchProvenance(id: string): Bluebird<ProvenanceRecord>
  fetchProvenanceChildren(id: string): Bluebird<readonly ProvenanceRecord[]>
  fetchPeriods(): Bluebird<string[]>
  fetchColophonNames(query: string): Bluebird<string[]>
  updateGenres(number: string, genres: Genres): Bluebird<Fragment>
  updateScopes(number: string, scopes: string[]): Bluebird<Fragment>
  updateScript(number: string, script: Script): Bluebird<Fragment>
  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
  ): Bluebird<Fragment>
  updateDatesInText(
    number: string,
    date: MesopotamianDateDto[],
  ): Bluebird<Fragment>
  updateEdition(number: string, updates: EditionFields): Bluebird<Fragment>
  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Bluebird<Fragment>
  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Bluebird<Fragment>
  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>,
  ): Bluebird<Fragment>
  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Bluebird<Fragment>
  updateColophon(number: string, colophon: Colophon): Bluebird<Fragment>
  folioPager(folio: Folio, fragmentNumber: string): Bluebird<FolioPagerData>
  fragmentPager(fragmentNumber: string): Bluebird<FragmentPagerData>
  findLemmas(lemma: string, isNormalized: boolean): Bluebird<Word[][]>
  lineToVecRanking(number: string): Bluebird<LineToVecRanking>
  query(fragmentQuery: FragmentQuery): Bluebird<QueryResult>
  queryLatest(): Bluebird<QueryResult>
  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Bluebird<FragmentAfoRegisterQueryResult>
  listAllFragments(): Bluebird<string[]>
  collectLemmaSuggestions(number: string): Bluebird<LemmaSuggestions>
  updateNamedEntityAnnotations(
    number: string,
    annotations: AnnotationSpans,
  ): Bluebird<Fragment>
}

export interface AnnotationRepository {
  findAnnotations(
    number: string,
    generateAnnotations: boolean,
  ): Bluebird<readonly Annotation[]>
  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Bluebird<readonly Annotation[]>
}

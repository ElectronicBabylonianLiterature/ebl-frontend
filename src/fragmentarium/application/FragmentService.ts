import Reference from 'bibliography/domain/Reference'
import Bluebird from 'bluebird'
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
  sortProvenances,
} from 'fragmentarium/domain/Provenance'
import {
  setProvenanceRecords,
  upsertProvenanceRecord,
} from 'corpus/domain/provenance'

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
  updateDate(number: string, date: MesopotamianDateDto): Bluebird<Fragment>
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
  fetchNamedEntityAnnotations(
    number: string,
  ): Bluebird<readonly ApiEntityAnnotationSpan[]>
  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
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
export class FragmentService {
  private readonly referenceInjector: ReferenceInjector
  private cachedProvenances: readonly ProvenanceRecord[] | null = null
  private cachedProvenancesRequest: Bluebird<
    readonly ProvenanceRecord[]
  > | null = null
  private readonly cachedProvenanceById = new Map<string, ProvenanceRecord>()
  private readonly cachedProvenanceByIdRequest = new Map<
    string,
    Bluebird<ProvenanceRecord>
  >()
  private readonly cachedProvenanceChildrenById = new Map<
    string,
    readonly ProvenanceRecord[]
  >()
  private readonly cachedProvenanceChildrenByIdRequest = new Map<
    string,
    Bluebird<readonly ProvenanceRecord[]>
  >()

  constructor(
    private readonly fragmentRepository: FragmentRepository &
      AnnotationRepository,
    private readonly imageRepository: ImageRepository,
    private readonly wordRepository: WordRepository,
    private readonly bibliographyService: BibliographyService,
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

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
    return this.fragmentRepository
      .find(number, lines, excludeLines)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .catch(onError)
  }

  isInFragmentarium(number: string): boolean {
    try {
      this.fragmentRepository.find(number)
      return true
    } catch {
      return false
    }
  }

  updateGenres(number: string, genres: Genres): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateGenres(number, genres)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateScript(number: string, script: Script): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateScript(number, script)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }
  updateScopes(number: string, scopes: string[]): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateScopes(number, scopes)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateDate(number: string, date: MesopotamianDateDto): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateDate(number, date)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateDatesInText(
    number: string,
    datesInText: MesopotamianDateDto[],
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateDatesInText(number, datesInText)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  fetchGenres(): Bluebird<string[][]> {
    return this.fragmentRepository.fetchGenres()
  }

  fetchProvenances(): Bluebird<readonly ProvenanceRecord[]> {
    if (this.cachedProvenances) {
      return Bluebird.resolve(this.cachedProvenances)
    }
    if (this.cachedProvenancesRequest) {
      return this.cachedProvenancesRequest
    }

    this.cachedProvenancesRequest = this.fragmentRepository
      .fetchProvenances()
      .then((provenances) => {
        const sorted = sortProvenances(provenances)
        setProvenanceRecords(sorted)
        this.cachedProvenances = sorted
        sorted.forEach((provenance) => {
          this.cachedProvenanceById.set(provenance.id, provenance)
        })
        return sorted
      })
      .finally(() => {
        this.cachedProvenancesRequest = null
      })

    return this.cachedProvenancesRequest
  }

  fetchProvenance(id: string): Bluebird<ProvenanceRecord> {
    const cachedProvenance = this.cachedProvenanceById.get(id)
    if (cachedProvenance) {
      return Bluebird.resolve(cachedProvenance)
    }

    const cachedRequest = this.cachedProvenanceByIdRequest.get(id)
    if (cachedRequest) {
      return cachedRequest
    }

    const request = this.fragmentRepository
      .fetchProvenance(id)
      .then((provenance) => {
        upsertProvenanceRecord(provenance)
        this.cachedProvenanceById.set(id, provenance)
        return provenance
      })
      .finally(() => {
        this.cachedProvenanceByIdRequest.delete(id)
      })

    this.cachedProvenanceByIdRequest.set(id, request)
    return request
  }

  fetchProvenanceChildren(id: string): Bluebird<readonly ProvenanceRecord[]> {
    const cachedChildren = this.cachedProvenanceChildrenById.get(id)
    if (cachedChildren) {
      return Bluebird.resolve(cachedChildren)
    }

    const cachedRequest = this.cachedProvenanceChildrenByIdRequest.get(id)
    if (cachedRequest) {
      return cachedRequest
    }

    const request = this.fragmentRepository
      .fetchProvenanceChildren(id)
      .then((children) => {
        const sorted = sortProvenances(children)
        this.cachedProvenanceChildrenById.set(id, sorted)
        sorted.forEach((provenance) => {
          upsertProvenanceRecord(provenance)
          this.cachedProvenanceById.set(provenance.id, provenance)
        })
        return sorted
      })
      .finally(() => {
        this.cachedProvenanceChildrenByIdRequest.delete(id)
      })

    this.cachedProvenanceChildrenByIdRequest.set(id, request)
    return request
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

  updateEdition(number: string, updates: EditionFields): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateEdition(number, updates)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateLemmatization(number, lemmatization)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateLemmaAnnotation(number, annotations)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>,
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateReferences(number, references)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateArchaeology(number, archaeology)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateColophon(number: string, colophon: Colophon): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateColophon(number, colophon)
      .then((fragment: Fragment) => this.injectReferences(fragment))
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
    return this.imageRepository.findThumbnail(fragment.number, size)
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

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Bluebird<readonly Annotation[]> {
    return this.fragmentRepository.updateAnnotations(number, annotations)
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
    return this.fragmentRepository.query(fragmentQuery)
  }

  queryLatest(): Bluebird<QueryResult> {
    return this.fragmentRepository.queryLatest()
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

  private injectReferences(fragment: Fragment): Bluebird<Fragment> {
    return this.referenceInjector
      .injectReferencesToText(fragment.text)
      .then((text) =>
        produce(fragment, (draft) => {
          draft.text = castDraft(text)
        }),
      )
      .then((fragment) =>
        Bluebird.all([
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
  ): Bluebird<readonly ApiEntityAnnotationSpan[]> {
    return this.fragmentRepository.fetchNamedEntityAnnotations(number)
  }
  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateNamedEntityAnnotations(number, annotations)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }
}

export default FragmentService

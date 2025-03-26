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
import produce, { castDraft } from 'immer'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { FragmentQuery } from 'query/FragmentQuery'
import { MesopotamianDate } from 'chronology/domain/Date'
import { FragmentAfoRegisterQueryResult, QueryResult } from 'query/QueryResult'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { LemmaAnnotations } from 'fragmentarium/ui/fragment/lemmatizer2/Lemmatizer'

export type ThumbnailSize = 'small' | 'medium' | 'large'

export const onError = (error) => {
  if (error.message === '403 Forbidden') {
    throw new Error("You don't have permissions to view this fragment.")
  } else {
    throw error
  }
}

export interface CdliInfo {
  readonly photoUrl: string | null
  readonly lineArtUrl: string | null
  readonly detailLineArtUrl: string | null
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
  [K in typeof editionFields[number]]: string | null
}

export interface FragmentRepository {
  statistics(): Bluebird<{ transliteratedFragments: number; lines: number }>
  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean
  ): Bluebird<Fragment>
  findInCorpus(number: string): Bluebird<ReadonlyArray<ManuscriptAttestation>>
  fetchGenres(): Bluebird<string[][]>
  fetchProvenances(): Bluebird<string[][]>
  fetchPeriods(): Bluebird<string[]>
  fetchColophonNames(query: string): Bluebird<string[]>
  updateGenres(number: string, genres: Genres): Bluebird<Fragment>
  updateScopes(number: string, scopes: string[]): Bluebird<Fragment>
  updateScript(number: string, script: Script): Bluebird<Fragment>
  updateDate(number: string, date: MesopotamianDate): Bluebird<Fragment>
  updateDatesInText(
    number: string,
    date: MesopotamianDate[]
  ): Bluebird<Fragment>
  updateEdition(number: string, updates: EditionFields): Bluebird<Fragment>
  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto
  ): Bluebird<Fragment>
  updateLemmaAnnotation(
    number: string,
    newLemmas: LemmaAnnotations
  ): Bluebird<Fragment>
  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>
  ): Bluebird<Fragment>
  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto
  ): Bluebird<Fragment>
  updateColophon(number: string, colophon: Colophon): Bluebird<Fragment>
  folioPager(folio: Folio, fragmentNumber: string): Bluebird<FolioPagerData>
  fragmentPager(fragmentNumber: string): Bluebird<FragmentPagerData>
  findLemmas(lemma: string, isNormalized: boolean): Bluebird<Word[][]>
  fetchCdliInfo(cdliNumber: string): Bluebird<CdliInfo>
  lineToVecRanking(number: string): Bluebird<LineToVecRanking>
  query(fragmentQuery: FragmentQuery): Bluebird<QueryResult>
  queryLatest(): Bluebird<QueryResult>
  queryByTraditionalReferences(
    traditionalReferences: string[]
  ): Bluebird<FragmentAfoRegisterQueryResult>
  listAllFragments(): Bluebird<string[]>
}

export interface AnnotationRepository {
  findAnnotations(
    number: string,
    generateAnnotations: boolean
  ): Bluebird<readonly Annotation[]>
  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Bluebird<readonly Annotation[]>
}
export class FragmentService {
  private readonly referenceInjector: ReferenceInjector

  constructor(
    private readonly fragmentRepository: FragmentRepository &
      AnnotationRepository,
    private readonly imageRepository: ImageRepository,
    private readonly wordRepository: WordRepository,
    private readonly bibliographyService: BibliographyService
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  statistics(): Bluebird<{ transliteratedFragments: number; lines: number }> {
    return this.fragmentRepository.statistics()
  }

  lineToVecRanking(number: string): Bluebird<LineToVecRanking> {
    return this.fragmentRepository.lineToVecRanking(number)
  }

  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean
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

  updateDate(number: string, date: MesopotamianDate): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateDate(number, date)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateDatesInText(
    number: string,
    datesInText: MesopotamianDate[]
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateDatesInText(number, datesInText)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  fetchGenres(): Bluebird<string[][]> {
    return this.fragmentRepository.fetchGenres()
  }

  fetchProvenances(): Bluebird<string[][]> {
    return this.fragmentRepository.fetchProvenances()
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
    lemmatization: LemmatizationDto
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateLemmatization(number, lemmatization)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LemmaAnnotations
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateLemmaAnnotation(number, annotations)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>
  ): Bluebird<Fragment> {
    return this.fragmentRepository
      .updateReferences(number, references)
      .then((fragment: Fragment) => this.injectReferences(fragment))
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto
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

  findInCorpus(number: string): Bluebird<ReadonlyArray<ManuscriptAttestation>> {
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
    size: ThumbnailSize
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

  fetchCdliInfo(fragment: Fragment): Bluebird<CdliInfo> {
    return fragment.getExternalNumber('cdliNumber')
      ? this.fragmentRepository.fetchCdliInfo(
          fragment.getExternalNumber('cdliNumber')
        )
      : Bluebird.resolve({
          photoUrl: null,
          lineArtUrl: null,
          detailLineArtUrl: null,
        })
  }

  findAnnotations(number: string): Bluebird<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, false)
  }
  generateAnnotations(number: string): Bluebird<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number, true)
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Bluebird<readonly Annotation[]> {
    return this.fragmentRepository.updateAnnotations(number, annotations)
  }

  createLemmatization(text: Text): Bluebird<Lemmatization> {
    return new LemmatizationFactory(
      this,
      this.wordRepository
    ).createLemmatization(text)
  }

  findSuggestions(
    value: string,
    isNormalized: boolean
  ): Bluebird<ReadonlyArray<UniqueLemma>> {
    return this.fragmentRepository
      .findLemmas(value, isNormalized)
      .then((lemmas: DictionaryWord[][]) =>
        lemmas.map((complexLemma: DictionaryWord[]) =>
          complexLemma.map((word: DictionaryWord) => new Lemma(word))
        )
      )
  }

  query(fragmentQuery: FragmentQuery): Bluebird<QueryResult> {
    return this.fragmentRepository.query(fragmentQuery)
  }

  queryLatest(): Bluebird<QueryResult> {
    return this.fragmentRepository.queryLatest()
  }

  queryByTraditionalReferences(
    traditionalReferences: string[]
  ): Bluebird<FragmentAfoRegisterQueryResult> {
    return this.fragmentRepository.queryByTraditionalReferences(
      traditionalReferences
    )
  }

  private injectReferences(fragment: Fragment): Bluebird<Fragment> {
    return this.referenceInjector
      .injectReferencesToText(fragment.text)
      .then((text) =>
        produce(fragment, (draft) => {
          draft.text = castDraft(text)
        })
      )
      .then((fragment) =>
        Bluebird.all([
          this.referenceInjector.injectReferencesToIntroduction(
            fragment.introduction
          ),
          this.referenceInjector.injectReferencesToNotes(fragment.notes),
        ]).then(([introduction, notes]) =>
          produce(fragment, (draft) => {
            draft.introduction = castDraft(introduction)
            draft.notes = castDraft(notes)
          })
        )
      )
  }
}

export default FragmentService

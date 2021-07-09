import Reference from 'bibliography/domain/Reference'
import Promise from 'bluebird'
import DictionaryWord from 'dictionary/domain/Word'
import Annotation from 'fragmentarium/domain/annotation'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
  LemmatizationDto,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import { Genres } from 'fragmentarium/domain/Genres'
import LemmatizationFactory from './LemmatizationFactory'
import { LineToVecRanking } from '../domain/lineToVecRanking'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'

export interface CdliInfo {
  readonly photoUrl: string | null
  readonly lineArtUrl: string | null
  readonly detailLineArtUrl: string | null
}

export interface ImageRepository {
  find(fileName: string): Promise<Blob>
  findFolio(folio: Folio): Promise<Blob>
  findPhoto(number: string): Promise<Blob>
}

export interface FragmentRepository {
  statistics(): Promise<{ transliteratedFragments: number; lines: number }>
  find(number: string): Promise<Fragment>
  fetchGenres(): Promise<string[][]>
  updateGenres(number: string, genres: Genres): Promise<Fragment>
  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ): Promise<Fragment>
  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto
  ): Promise<Fragment>
  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>
  ): Promise<Fragment>
  folioPager(folio: Folio, fragmentNumber: string): Promise<FolioPagerData>
  fragmentPager(fragmentNumber: string): Promise<FragmentPagerData>
  findLemmas(lemma: string, isNormalized: boolean): Promise<Word[][]>
  fetchCdliInfo(cdliNumber: string): Promise<CdliInfo>
  lineToVecRanking(number: string): Promise<LineToVecRanking>
}

export interface AnnotationRepository {
  findAnnotations(number: string): Promise<readonly Annotation[]>
  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Promise<readonly Annotation[]>
}
export class FragmentService {
  constructor(
    private readonly fragmentRepository: FragmentRepository &
      AnnotationRepository,
    private readonly imageRepository: ImageRepository,
    private readonly wordRepository: WordRepository,
    private readonly bibliographyService: BibliographyService
  ) {}

  statistics(): Promise<{ transliteratedFragments: number; lines: number }> {
    return this.fragmentRepository.statistics()
  }

  lineToVecRanking(number: string): Promise<LineToVecRanking> {
    return this.fragmentRepository.lineToVecRanking(number)
  }

  find(number: string): Promise<Fragment> {
    return this.fragmentRepository.find(number)
  }

  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    return this.fragmentRepository.updateGenres(number, genres)
  }

  fetchGenres(): Promise<string[][]> {
    return this.fragmentRepository.fetchGenres()
  }

  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ): Promise<Fragment> {
    return this.fragmentRepository.updateTransliteration(
      number,
      transliteration,
      notes
    )
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto
  ): Promise<Fragment> {
    return this.fragmentRepository.updateLemmatization(number, lemmatization)
  }

  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>
  ): Promise<Fragment> {
    return this.fragmentRepository.updateReferences(number, references)
  }

  findFolio(folio: Folio): Promise<Blob> {
    return this.imageRepository.findFolio(folio)
  }

  findImage(fileName: string): Promise<Blob> {
    return this.imageRepository.find(fileName)
  }

  findPhoto(fragment: Fragment): Promise<Blob> {
    if (fragment.hasPhoto) {
      return this.imageRepository.findPhoto(fragment.number)
    } else {
      throw Error(`Fragment ${fragment.number} doesn't have a Photo`)
    }
  }

  folioPager(folio: Folio, fragmentNumber: string): Promise<FolioPagerData> {
    return this.fragmentRepository.folioPager(folio, fragmentNumber)
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

  fetchCdliInfo(fragment: Fragment): Promise<CdliInfo> {
    return fragment.cdliNumber
      ? this.fragmentRepository.fetchCdliInfo(fragment.cdliNumber)
      : Promise.resolve({
          photoUrl: null,
          lineArtUrl: null,
          detailLineArtUrl: null,
        })
  }

  findAnnotations(number: string): Promise<readonly Annotation[]> {
    return this.fragmentRepository.findAnnotations(number)
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Promise<readonly Annotation[]> {
    return this.fragmentRepository.updateAnnotations(number, annotations)
  }

  createLemmatization(text: Text): Promise<Lemmatization> {
    return new LemmatizationFactory(
      this,
      this.wordRepository
    ).createLemmatization(text)
  }

  findSuggestions(
    value: string,
    isNormalized: boolean
  ): Promise<ReadonlyArray<UniqueLemma>> {
    return this.fragmentRepository
      .findLemmas(value, isNormalized)
      .then((lemmas: DictionaryWord[][]) =>
        lemmas.map((complexLemma: DictionaryWord[]) =>
          complexLemma.map((word: DictionaryWord) => new Lemma(word))
        )
      )
  }
}

export default FragmentService

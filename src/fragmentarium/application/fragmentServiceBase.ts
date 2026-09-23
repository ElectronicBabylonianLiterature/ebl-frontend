import Reference from 'bibliography/domain/Reference'
import Bluebird from 'bluebird'
import Annotation from 'fragmentarium/domain/annotation'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
import { Genres } from 'fragmentarium/domain/Genres'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { AnnotationSaveResult } from 'fragmentarium/ui/text-annotation/annotationSave'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import {
  AnnotationRepository,
  EditionFields,
  FragmentRepository,
  ImageRepository,
} from 'fragmentarium/application/fragmentServicePorts'
import {
  defaultCacheScope,
  FragmentCache,
} from 'fragmentarium/application/fragmentCache'
import { injectReferences } from 'fragmentarium/application/fragmentReferences'

const fragmentFetchConcurrencyLimit = 6
const thumbnailFetchConcurrencyLimit = 8

export class FragmentServiceBase {
  protected readonly referenceInjector: ReferenceInjector
  protected readonly cache: FragmentCache
  protected readonly fragmentFetchLimiter = new ConcurrencyLimiter(
    fragmentFetchConcurrencyLimit,
  )
  protected readonly thumbnailFetchLimiter = new ConcurrencyLimiter(
    thumbnailFetchConcurrencyLimit,
  )

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
  }

  updateGenres(number: string, genres: Genres): Bluebird<Fragment> {
    return this.refresh(this.fragmentRepository.updateGenres(number, genres))
  }

  updateScript(number: string, script: Script): Bluebird<Fragment> {
    return this.refresh(this.fragmentRepository.updateScript(number, script))
  }

  updateScopes(number: string, scopes: string[]): Bluebird<Fragment> {
    return this.refresh(this.fragmentRepository.updateScopes(number, scopes))
  }

  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
  ): Bluebird<Fragment> {
    return this.refresh(this.fragmentRepository.updateDate(number, date))
  }

  updateDatesInText(
    number: string,
    datesInText: MesopotamianDateDto[],
  ): Bluebird<Fragment> {
    return this.refresh(
      this.fragmentRepository.updateDatesInText(number, datesInText),
    )
  }

  updateEdition(number: string, updates: EditionFields): Bluebird<Fragment> {
    return this.refresh(this.fragmentRepository.updateEdition(number, updates))
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Bluebird<Fragment> {
    return this.refresh(
      this.fragmentRepository.updateLemmatization(number, lemmatization),
    )
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Bluebird<Fragment> {
    return this.refresh(
      this.fragmentRepository.updateLemmaAnnotation(number, annotations),
    )
  }

  updateReferences(
    number: string,
    references: readonly Reference[],
  ): Bluebird<Fragment> {
    return this.refresh(
      this.fragmentRepository.updateReferences(number, references),
    )
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Bluebird<Fragment> {
    return this.refresh(
      this.fragmentRepository.updateArchaeology(number, archaeology),
    )
  }

  updateColophon(number: string, colophon: Colophon): Bluebird<Fragment> {
    return this.refresh(
      this.fragmentRepository.updateColophon(number, colophon),
    )
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Bluebird<readonly Annotation[]> {
    return this.fragmentRepository
      .updateAnnotations(number, annotations)
      .then((updatedAnnotations) => {
        this.cache.clearFragments(number)
        this.cache.clearQueryResults()
        return updatedAnnotations
      })
  }

  updateNamedEntityAnnotations(
    number: string,
    annotations: AnnotationSpans,
  ): Bluebird<AnnotationSaveResult> {
    return this.fragmentRepository
      .updateNamedEntityAnnotations(number, annotations)
      .then((persisted: Fragment) =>
        this.injectReferences(persisted)
          .then((fragment: Fragment) => ({
            fragment: this.cache.storeUpdatedFragment(fragment),
            refreshError: null,
          }))
          .catch((error: Error) => ({
            fragment: persisted,
            refreshError: error,
          })),
      )
  }

  protected refresh(updated: Bluebird<Fragment>): Bluebird<Fragment> {
    return updated
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cache.storeUpdatedFragment(fragment))
  }

  protected injectReferences(fragment: Fragment): Bluebird<Fragment> {
    return injectReferences(this.referenceInjector, fragment)
  }
}

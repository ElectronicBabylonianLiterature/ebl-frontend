import Reference from 'bibliography/domain/Reference'
import Annotation from 'fragmentarium/domain/annotation'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import FragmentCache from 'fragmentarium/application/FragmentCache'
import {
  AnnotationRepository,
  EditionFields,
  FragmentRepository,
} from 'fragmentarium/application/FragmentRepositoryTypes'
import injectFragmentReferences from 'fragmentarium/application/injectFragmentReferences'

export default class FragmentWriter {
  constructor(
    private readonly fragmentRepository: FragmentRepository &
      AnnotationRepository,
    private readonly referenceInjector: ReferenceInjector,
    private readonly cache: FragmentCache,
  ) {}

  private injectReferences(fragment: Fragment): Promise<Fragment> {
    return injectFragmentReferences(this.referenceInjector, fragment)
  }

  private applyFragmentUpdate(update: Promise<Fragment>): Promise<Fragment> {
    return update
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cache.cacheUpdatedFragment(fragment))
  }

  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateGenres(number, genres),
    )
  }

  updateScript(number: string, script: Script): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateScript(number, script),
    )
  }

  updateScopes(number: string, scopes: string[]): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateScopes(number, scopes),
    )
  }

  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
  ): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateDate(number, date),
    )
  }

  updateDatesInText(
    number: string,
    datesInText: MesopotamianDateDto[],
  ): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateDatesInText(number, datesInText),
    )
  }

  updateEdition(number: string, updates: EditionFields): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateEdition(number, updates),
    )
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateLemmatization(number, lemmatization),
    )
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateLemmaAnnotation(number, annotations),
    )
  }

  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>,
  ): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateReferences(number, references),
    )
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateArchaeology(number, archaeology),
    )
  }

  updateColophon(number: string, colophon: Colophon): Promise<Fragment> {
    return this.applyFragmentUpdate(
      this.fragmentRepository.updateColophon(number, colophon),
    )
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]> {
    return this.fragmentRepository
      .updateAnnotations(number, annotations)
      .then((updatedAnnotations) => {
        this.cache.invalidateFragment(number)
        return updatedAnnotations
      })
  }

  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
  ): Promise<Fragment> {
    return this.fragmentRepository
      .updateNamedEntityAnnotations(number, annotations)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .then((fragment: Fragment) => this.cache.cacheUpdatedFragment(fragment))
  }
}

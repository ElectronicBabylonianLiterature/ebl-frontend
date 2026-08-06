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
import { EditionFields } from 'fragmentarium/application/FragmentRepositoryTypes'
import FragmentReadService from 'fragmentarium/application/FragmentReadService'

export * from 'fragmentarium/application/FragmentRepositoryTypes'

export class FragmentService extends FragmentReadService {
  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    return this.writer.updateGenres(number, genres)
  }

  updateScript(number: string, script: Script): Promise<Fragment> {
    return this.writer.updateScript(number, script)
  }

  updateScopes(number: string, scopes: string[]): Promise<Fragment> {
    return this.writer.updateScopes(number, scopes)
  }

  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
  ): Promise<Fragment> {
    return this.writer.updateDate(number, date)
  }

  updateDatesInText(
    number: string,
    datesInText: MesopotamianDateDto[],
  ): Promise<Fragment> {
    return this.writer.updateDatesInText(number, datesInText)
  }

  updateEdition(number: string, updates: EditionFields): Promise<Fragment> {
    return this.writer.updateEdition(number, updates)
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment> {
    return this.writer.updateLemmatization(number, lemmatization)
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Promise<Fragment> {
    return this.writer.updateLemmaAnnotation(number, annotations)
  }

  updateReferences(
    number: string,
    references: ReadonlyArray<Reference>,
  ): Promise<Fragment> {
    return this.writer.updateReferences(number, references)
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Promise<Fragment> {
    return this.writer.updateArchaeology(number, archaeology)
  }

  updateColophon(number: string, colophon: Colophon): Promise<Fragment> {
    return this.writer.updateColophon(number, colophon)
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]> {
    return this.writer.updateAnnotations(number, annotations)
  }

  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
  ): Promise<Fragment> {
    return this.writer.updateNamedEntityAnnotations(number, annotations)
  }
}

export default FragmentService

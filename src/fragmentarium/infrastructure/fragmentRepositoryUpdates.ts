import Promise from 'bluebird'
import _ from 'lodash'
import { produce } from 'immer'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import Reference from 'bibliography/domain/Reference'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
import Annotation from 'fragmentarium/domain/annotation'
import FragmentDto, {
  MesopotamianDateDto,
} from 'fragmentarium/domain/FragmentDtos'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { EditionFields } from 'fragmentarium/application/FragmentService'
import {
  createFragment,
  createFragmentPath,
} from 'fragmentarium/infrastructure/fragmentFactories'
import { ApiFragmentAttestations } from 'fragmentarium/infrastructure/fragmentRepositoryAttestations'

export class ApiFragmentUpdates extends ApiFragmentAttestations {
  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    const path = createFragmentPath(number, 'genres')
    return this.apiClient
      .postJson<FragmentDto>(path, {
        genres: genres.genres,
      })
      .then(createFragment)
  }
  updateScopes(number: string, scopes: string[]): Promise<Fragment> {
    const path = createFragmentPath(number, 'scopes')
    return (
      this.apiClient
        // eslint-disable-next-line camelcase
        .postJson<FragmentDto>(path, { authorized_scopes: scopes })
        .then(createFragment)
    )
  }
  updateScript(number: string, script: Script): Promise<Fragment> {
    const path = createFragmentPath(number, 'script')
    return this.apiClient
      .postJson<FragmentDto>(path, {
        script: {
          period: script.period.name,
          periodModifier: script.periodModifier.name,
          uncertain: script.uncertain,
        },
      })
      .then(createFragment)
  }

  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'date')
    return this.apiClient
      .postJson<FragmentDto>(path, { date })
      .then(createFragment)
  }

  updateDatesInText(
    number: string,
    datesInText: readonly MesopotamianDateDto[],
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'dates-in-text')
    return this.apiClient
      .postJson<FragmentDto>(path, { datesInText })
      .then(createFragment)
  }

  updateEdition(number: string, updates: EditionFields): Promise<Fragment> {
    const path = createFragmentPath(number, 'edition')
    return this.apiClient
      .postJson<FragmentDto>(path, _.omitBy(updates, _.isNull))
      .then(createFragment)
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'lemmatization')
    return this.apiClient
      .postJson<FragmentDto>(path, { lemmatization: lemmatization })
      .then(createFragment)
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'lemma-annotation')
    return this.apiClient
      .postJson<FragmentDto>(path, annotations)
      .then(createFragment)
  }

  updateReferences(number: string, references: Reference[]): Promise<Fragment> {
    const path = createFragmentPath(number, 'references')
    return this.apiClient
      .postJson<FragmentDto>(path, { references: references })
      .then(createFragment)
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'archaeology')
    return this.apiClient
      .postJson<FragmentDto>(path, { archaeology: archaeology })
      .then(createFragment)
  }

  updateColophon(number: string, colophon: Colophon): Promise<Fragment> {
    const path = createFragmentPath(number, 'colophon')
    return this.apiClient
      .postJson<FragmentDto>(path, { colophon: colophon })
      .then(createFragment)
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]> {
    return this.apiClient.postJson<readonly Annotation[]>(
      `${createFragmentPath(number)}/annotations`,
      {
        fragmentNumber: number,
        annotations: annotations.map(
          produce((annotation) => ({
            geometry: _.omit(annotation.geometry, 'type'),
            data: annotation.data,
          })),
        ),
      },
    )
  }

  updateNamedEntityAnnotations(
    number: string,
    annotations: AnnotationSpans,
  ): Promise<Fragment> {
    return this.apiClient
      .postJson<FragmentDto>(createFragmentPath(number, 'named-entities'), {
        namedEntities: annotations.namedEntities,
        realia: annotations.realia,
      })
      .then(createFragment)
  }
}

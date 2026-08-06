import _ from 'lodash'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import Reference from 'bibliography/domain/Reference'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
import { Genres } from 'fragmentarium/domain/Genres'
import FragmentDto, {
  MesopotamianDateDto,
} from 'fragmentarium/domain/FragmentDtos'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import {
  AnnotationRepository,
  EditionFields,
  FragmentRepository,
} from 'fragmentarium/application/FragmentService'
import { FragmentInfoRepository } from 'fragmentarium/application/FragmentSearchService'
import ApiFragmentReadRepository from 'fragmentarium/infrastructure/ApiFragmentReadRepository'
import {
  createFragment,
  createFragmentPath,
} from 'fragmentarium/infrastructure/createFragment'

export {
  createScript,
  createJoins,
  createFragment,
  createFragmentInfo,
  createFragmentPath,
  createLineToVecRanking,
} from 'fragmentarium/infrastructure/createFragment'

class ApiFragmentRepository
  extends ApiFragmentReadRepository
  implements FragmentInfoRepository, FragmentRepository, AnnotationRepository
{
  private postFragmentUpdate(
    number: string,
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<Fragment> {
    return this.apiClient
      .postJson<FragmentDto>(createFragmentPath(number, endpoint), body)
      .then(createFragment)
  }

  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'genres', { genres: genres.genres })
  }

  updateScopes(number: string, scopes: string[]): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'scopes', {
      // eslint-disable-next-line camelcase
      authorized_scopes: scopes,
    })
  }

  updateScript(number: string, script: Script): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'script', {
      script: {
        period: script.period.name,
        periodModifier: script.periodModifier.name,
        uncertain: script.uncertain,
      },
    })
  }

  updateDate(
    number: string,
    date: MesopotamianDateDto | undefined,
  ): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'date', { date })
  }

  updateDatesInText(
    number: string,
    datesInText: readonly MesopotamianDateDto[],
  ): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'dates-in-text', { datesInText })
  }

  updateEdition(number: string, updates: EditionFields): Promise<Fragment> {
    return this.postFragmentUpdate(
      number,
      'edition',
      _.omitBy(updates, _.isNull),
    )
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'lemmatization', { lemmatization })
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'lemma-annotation', annotations)
  }

  updateReferences(number: string, references: Reference[]): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'references', { references })
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'archaeology', { archaeology })
  }

  updateColophon(number: string, colophon: Colophon): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'colophon', { colophon })
  }

  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
  ): Promise<Fragment> {
    return this.postFragmentUpdate(number, 'named-entities', { annotations })
  }
}

export default ApiFragmentRepository

import _ from 'lodash'
import Chance from 'chance'
import { Factory } from 'fishery'

import {
  Manuscript,
  ManuscriptType,
  ManuscriptTypes,
} from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'corpus/domain/period'
import { Provenance, Provenances } from 'corpus/domain/provenance'

const defaultChance = new Chance()

class ManuscriptFactory extends Factory<Manuscript> {
  standardText() {
    return this.associations({
      provenance: Provenances['Standard Text'],
      periodModifier: PeriodModifiers.None,
      period: Periods.None,
      type: ManuscriptTypes.None,
    })
  }

  assyria() {
    return this.associations({
      provenance: Provenances.Assyria,
    })
  }

  babylonia() {
    return this.associations({
      provenance: Provenances.Babylonia,
    })
  }

  city() {
    return this.associations({
      provenance: defaultChance.pickone(
        _.without(
          Object.values(Provenances),
          Provenances['Standard Text'],
          Provenances.Assyria,
          Provenances.Babylonia
        )
      ),
    })
  }

  type(type: ManuscriptType) {
    return this.associations({
      type: type,
    })
  }

  provenance(provenance: Provenance) {
    return this.associations({
      provenance: provenance,
    })
  }
}

export const manuscriptFactory = ManuscriptFactory.define(
  ({ sequence, associations }) => {
    const hasMuseumNumber = defaultChance.bool()
    return new Manuscript(
      defaultChance.natural(),
      defaultChance.string(),
      [],
      hasMuseumNumber ? `X.${sequence}` : '',
      !hasMuseumNumber ? `A ${sequence}` : '',
      associations.periodModifier ??
        defaultChance.pickone(Object.values(PeriodModifiers)),
      associations.period ??
        defaultChance.pickone(_.without(Object.values(Periods), Periods.None)),
      associations.provenance ??
        defaultChance.pickone(
          _.without(Object.values(Provenances), Provenances['Standard Text'])
        ),
      associations.type ??
        defaultChance.pickone(
          _.without(Object.values(ManuscriptTypes), ManuscriptTypes.None)
        ),
      defaultChance.sentence(),
      '',
      '',
      []
    )
  }
)

export const manuscriptDtoFactory = Factory.define<
  {
    id: number | null
    siglumDisambiguator: string
    oldSigla: []
    museumNumber: string
    accession: string
    periodModifier: string
    period: string
    provenance: string
    type: string
    notes: string
    colophon: string
    unplacedLines: string
    references: []
    joins: []
    isInFragmentarium: boolean
  },
  { hasMuseumNumber: boolean; chance: Chance.Chance }
>(({ sequence, transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  const hasMuseumNumber = transientParams.hasMuseumNumber ?? chance.bool()
  return {
    id: sequence,
    siglumDisambiguator: chance.string(),
    oldSigla: [],
    museumNumber: hasMuseumNumber ? `X.${sequence}` : '',
    accession: !hasMuseumNumber ? `A ${sequence}` : '',
    periodModifier: chance.pickone(Object.values(PeriodModifiers)).name,
    period: chance.pickone(_.without(Object.values(Periods), Periods.None))
      .name,
    provenance: chance.pickone(
      _.without(Object.values(Provenances), Provenances['Standard Text'])
    ).name,
    type: chance.pickone(
      _.without(Object.values(ManuscriptTypes), ManuscriptTypes.None)
    ).name,
    notes: chance.sentence(),
    colophon: '',
    unplacedLines: '',
    references: [],
    joins: [],
    isInFragmentarium: false,
  }
})

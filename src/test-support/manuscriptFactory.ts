import _ from 'lodash'
import Chance from 'chance'
import { Factory } from 'fishery'

import { Manuscript, ManuscriptTypes } from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'corpus/domain/period'
import { Provenances } from 'corpus/domain/provenance'

const chance = new Chance()

class ManuscriptFactory extends Factory<Manuscript> {
  standardText() {
    return this.associations({
      provenance: Provenances['Standard Text'],
      periodModifier: PeriodModifiers.None,
      period: Periods.None,
      type: ManuscriptTypes.None,
    })
  }

  asyria() {
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
      provenance: chance.pickone(
        _.without(
          Object.values(Provenances),
          Provenances['Standard Text'],
          Provenances.Assyria,
          Provenances.Babylonia
        )
      ),
    })
  }
}

export default ManuscriptFactory.define(({ sequence, associations }) => {
  const hasMuseumNumber = chance.bool()
  return new Manuscript(
    chance.natural(),
    chance.string(),
    hasMuseumNumber ? `X.${sequence}` : '',
    !hasMuseumNumber ? `A ${sequence}` : '',
    associations.periodModifier ??
      chance.pickone(Object.values(PeriodModifiers)),
    associations.period ??
      chance.pickone(_.without(Object.values(Periods), Periods.None)),
    associations.provenance ??
      chance.pickone(
        _.without(Object.values(Provenances), Provenances['Standard Text'])
      ),
    associations.type ??
      chance.pickone(
        _.without(Object.values(ManuscriptTypes), ManuscriptTypes.None)
      ),
    chance.sentence(),
    '',
    '',
    []
  )
})

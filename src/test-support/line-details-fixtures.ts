import _ from 'lodash'
import Chance from 'chance'
import { Factory } from 'fishery'

import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'corpus/domain/period'
import { Provenances } from 'corpus/domain/provenance'
import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import textLine from './lines/text-line'
import note from './lines/note'
import { singleRuling } from './lines/dollar'

const defaultChance = new Chance()

class ManuscriptLineDisplayFactory extends Factory<
  ManuscriptLineDisplay,
  { chance: Chance.Chance }
> {
  standardText() {
    return this.associations({
      provenance: Provenances['Standard Text'],
      periodModifier: PeriodModifiers.None,
      period: Periods.None,
      type: ManuscriptTypes.None,
    })
  }

  parallelText() {
    return this.associations({
      type: ManuscriptTypes.Parallel,
    })
  }
}

export const manuscriptLineDisplay = ManuscriptLineDisplayFactory.define(
  ({ associations, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return new ManuscriptLineDisplay(
      associations.provenance ??
        chance.pickone(
          _.without(Object.values(Provenances), Provenances['Standard Text'])
        ),
      associations.periodModifier ??
        chance.pickone(Object.values(PeriodModifiers)),
      associations.period ??
        chance.pickone(_.without(Object.values(Periods), Periods.None)),
      associations.type ??
        chance.pickone(
          _.without(
            Object.values(ManuscriptTypes),
            ManuscriptTypes.None,
            ManuscriptTypes.Parallel
          )
        ),
      chance.word(),
      chance.pickone([[], ['r'], ['o'], ['o', 'i'], ['iii']]),
      associations.line ?? textLine,
      associations.paratext ??
        chance.pickone([[], [singleRuling], [note], [note, singleRuling]])
    )
  }
)

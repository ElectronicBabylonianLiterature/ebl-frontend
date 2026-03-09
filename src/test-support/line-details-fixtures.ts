import Chance from 'chance'
import _ from 'lodash'

import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'
import { Factory } from 'fishery'
import { EmptyLine } from 'transliteration/domain/line'
import { singleRuling } from './lines/dollar'
import note from './lines/note'
import textLine from './lines/text-line'
import { referenceFactory } from './bibliography-fixtures'
import { oldSiglumFactory } from './old-siglum-fixtures'
import { joinFactory } from './join-fixtures'

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

  empty() {
    return this.associations({
      line: new EmptyLine(),
    })
  }
}

export const manuscriptLineDisplayFactory = ManuscriptLineDisplayFactory.define(
  ({ associations, transientParams, sequence }) => {
    const chance = transientParams.chance ?? defaultChance
    const museumNumber = `${defaultChance.word()}.${sequence}`

    return new ManuscriptLineDisplay(
      associations.provenance ??
        chance.pickone(
          _.without(Object.values(Provenances), Provenances['Standard Text']),
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
            ManuscriptTypes.Parallel,
          ),
        ),
      chance.word(),
      associations.oldSigla ??
        oldSiglumFactory.buildList(
          1,
          {},
          {
            transient: { chance },
          },
        ),
      chance.pickone([[], ['r'], ['o'], ['o', 'i'], ['iii']]),
      associations.line ?? textLine,
      associations.paratext ??
        chance.pickone([[], [singleRuling], [note], [note, singleRuling]]),
      associations.references ?? referenceFactory.buildList(2),
      associations.joins ?? [
        [joinFactory.build({ museumNumber, isInFragmentarium: true })],
        [joinFactory.build()],
      ],
      museumNumber,
      associations.isInFragmentarium ?? false,
      associations.accession ?? chance.word(),
    )
  },
)

import Chance from 'chance'
import _ from 'lodash'

import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { Provenances } from 'corpus/domain/provenance'
import { Factory } from 'fishery'
import { EmptyLine } from 'transliteration/domain/line'
import { singleRuling } from 'test-support/lines/dollar'
import note from 'test-support/lines/note'
import textLine from 'test-support/lines/text-line'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { oldSiglumFactory } from 'test-support/old-siglum-fixtures'
import { joinFactory } from 'test-support/join-fixtures'

const defaultChance = new Chance('line-details-fixtures')

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

    return new ManuscriptLineDisplay({
      provenance:
        associations.provenance ??
        chance.pickone(
          _.without(Object.values(Provenances), Provenances['Standard Text']),
        ),
      periodModifier:
        associations.periodModifier ??
        chance.pickone(Object.values(PeriodModifiers)),
      period:
        associations.period ??
        chance.pickone(_.without(Object.values(Periods), Periods.None)),
      type:
        associations.type ??
        chance.pickone(
          _.without(
            Object.values(ManuscriptTypes),
            ManuscriptTypes.None,
            ManuscriptTypes.Parallel,
          ),
        ),
      siglumDisambiguator: chance.word(),
      oldSigla:
        associations.oldSigla ??
        oldSiglumFactory.buildList(
          1,
          {},
          {
            transient: { chance },
          },
        ),
      labels: chance.pickone([[], ['r'], ['o'], ['o', 'i'], ['iii']]),
      line: associations.line ?? textLine,
      paratext:
        associations.paratext ??
        chance.pickone([[], [singleRuling], [note], [note, singleRuling]]),
      references: associations.references ?? referenceFactory.buildList(2),
      joins: associations.joins ?? [
        [joinFactory.build({ museumNumber, isInFragmentarium: true })],
        [joinFactory.build()],
      ],
      museumNumber: museumNumber,
      isInFragmentarium: associations.isInFragmentarium ?? false,
      accession: associations.accession ?? chance.word(),
    })
  },
)

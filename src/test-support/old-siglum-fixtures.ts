import { Factory } from 'fishery'
import Chance from 'chance'
import { OldSiglum } from 'corpus/domain/manuscript'
import {
  bibliographyEntryFactory,
  cslDataFactory,
  referenceDtoFactory,
  referenceFactory,
} from './bibliography-fixtures'
import { OldSiglumDto } from 'corpus/application/dtos'

const defaultChance = new Chance()

export const oldSiglumFactory = Factory.define<OldSiglum>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    const entry = bibliographyEntryFactory.build({}, { transient: { chance } })

    return new OldSiglum(
      chance.word(),
      referenceFactory.build({ document: entry }, { transient: { chance } }),
    )
  },
)

export const oldSiglumDtoFactory = Factory.define<
  OldSiglumDto,
  { chance: Chance.Chance }
>(({ associations, transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  const cslData = cslDataFactory.build()

  return {
    siglum: chance.string(),
    reference: referenceDtoFactory.build(
      {},
      { associations: { document: cslData } },
    ),
  }
})

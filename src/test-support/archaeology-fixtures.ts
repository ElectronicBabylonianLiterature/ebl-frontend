import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  Archaeology,
  DateRange,
  ExcavationPlan,
  Findspot,
  PartialDate,
  ExcavationSite,
} from 'fragmentarium/domain/archaeology'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { fragmentDataFixtureChance } from 'test-support/fragment-data-fixture-chance'

const defaultChance: Chance.Chance = fragmentDataFixtureChance

const testExcavationSites: readonly ExcavationSite[] = [
  { name: 'Babylon', abbreviation: 'Bab', parent: 'Babylonia' },
  { name: 'Periphery', abbreviation: '', parent: null },
  { name: 'Assyria', abbreviation: 'Assa', parent: null },
  { name: '‘Anah', abbreviation: 'Anh', parent: 'Periphery' },
]

const partialDateFactory = Factory.define<PartialDate>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    const year = chance.integer({ min: 1850, max: 2020 })
    const month = chance.pickone([null, chance.integer({ min: 1, max: 12 })])
    return new PartialDate(
      year,
      month,
      month && chance.pickone([null, chance.integer({ min: 1, max: 28 })]),
    )
  },
)

export const dateRangeFactory = Factory.define<DateRange>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      start: partialDateFactory.build(),
      end: partialDateFactory.build(),
      notes: chance.sentence({ words: 2 }),
    }
  },
)

export const excavationPlanFactory = Factory.define<ExcavationPlan>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      svg: '<svg></svg>',
      references: referenceFactory.buildList(1, {}, { transient: chance }),
    }
  },
)

export const findspotFactory = Factory.define<Findspot>(
  ({ transientParams, sequence }) => {
    const chance = transientParams.chance ?? defaultChance

    return new Findspot(
      sequence,
      chance.pickone(testExcavationSites),
      chance.word(),
      chance.word(),
      chance.word(),
      chance.pickone(['RESIDENTIAL', 'TEMPLE', 'UNKNOWN']),
      chance.pickone(['I', 'II', undefined]),
      dateRangeFactory.build(),
      excavationPlanFactory.buildList(1),
      chance.word(),
      chance.word(),
      chance.bool(),
      chance.sentence({ words: 3 }),
    )
  },
)

export const archaeologyFactory = Factory.define<Archaeology>(
  ({ transientParams, sequence, associations }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      excavationNumber: `${chance.word()}.${sequence}`,
      site: chance.pickone(testExcavationSites),
      isRegularExcavation: chance.bool(),
      isFindspotUncertain: chance.bool(),
      findspot: associations.findspot,
      findspotId: associations.findspot?.id,
    }
  },
)

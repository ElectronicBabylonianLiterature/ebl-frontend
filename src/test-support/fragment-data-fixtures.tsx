import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  Measures,
  Script,
  UncuratedReference,
} from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import Folio from 'fragmentarium/domain/Folio'
import { periodModifiers, periods } from 'common/utils/period'
import { ExternalNumbers } from 'fragmentarium/domain/FragmentDtos'
import { FolioPagerData, FragmentAndFolio } from 'fragmentarium/domain/pager'
import { fragmentDataFixtureChance } from 'test-support/fragment-data-fixture-chance'
import {
  archaeologyFactory,
  dateRangeFactory,
  excavationPlanFactory,
  findspotFactory,
} from 'test-support/archaeology-fixtures'

export {
  archaeologyFactory,
  dateRangeFactory,
  excavationPlanFactory,
  findspotFactory,
}

const defaultChance: Chance.Chance = fragmentDataFixtureChance

export function fragmentDate(chance: Chance.Chance = defaultChance): string {
  return chance.date().toISOString()
}

export function fragmentDateRange(): string {
  return `${fragmentDate()}/${fragmentDate()}`
}

export function fragmentDescription(
  chance: Chance.Chance = defaultChance,
): string {
  return `${chance.sentence()}\n${chance.sentence()}`
}

function date(chance: Chance.Chance = defaultChance): string {
  return chance.date().toISOString()
}

function dateRange(): string {
  return `${date()}/${date()}`
}

const collection = [
  'Babylon',
  'Kuyunjik',
  'Nippur',
  '',
  'Sippar',
  'Nimrud',
  'Ur',
  'Iraq',
  'Girsu',
  'Larsa',
  'Bābili',
  'Umma',
  'Kanesh',
  'uncertain',
  'Puzriš',
  'Shuruppak',
  'Kisurra',
  'Ešnunna',
  'Uruk',
  'Shibaniba',
  'Kalhu',
  'Tutub',
  'Susa',
  'Kish',
  'Anšan',
  'Ašnakkum',
  'Lagash',
  'Assur',
  'Huzirina',
]

export function fragmentCollection(
  chance: Chance.Chance = defaultChance,
): string {
  return chance.pickone(collection)
}

export const statisticsFactory = Factory.define<{
  transliteratedFragments: number
  lines: number
  totalFragments: number
}>(() => ({
  transliteratedFragments: defaultChance.natural(),
  lines: defaultChance.natural(),
  totalFragments: defaultChance.natural(),
}))

class RecordFactory extends Factory<RecordEntry> {
  historical(date: string | null = null) {
    return this.params({
      date: date ?? dateRange(),
      type: 'HistoricalTransliteration',
    })
  }
}

export const recordFactory = RecordFactory.define(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance

  return new RecordEntry({
    user: chance.last(),
    date: date(chance),
    type: chance.pickone(['Transliteration', 'Collation', 'Revision']),
  })
})

export const measuresFactory = Factory.define<Measures>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      length: chance.floating({ min: 0, max: 100 }),
      width: chance.floating({ min: 0, max: 100 }),
      thickness: chance.floating({ min: 0, max: 100 }),
      lengthNote: chance.pickone([null, chance.sentence({ words: 2 })]),
      widthNote: chance.pickone([null, chance.sentence({ words: 2 })]),
      thicknessNote: chance.pickone([null, chance.sentence({ words: 2 })]),
    }
  },
)

export const folioFactory = Factory.define<Folio>(
  ({ associations, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance

    return new Folio({
      name:
        associations.name ?? chance.pickone(['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
      number: associations.number ?? chance.string(),
    })
  },
)

export const uncuratedReferenceFactory = Factory.define<UncuratedReference>(
  () => ({
    document: defaultChance.sentence(),
    pages: defaultChance.n(defaultChance.natural, 5),
  }),
)

export const scriptFactory = Factory.define<Script>(
  ({ associations, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      period: associations.period ?? chance.pickone([...periods]),
      periodModifier:
        associations.periodModifier ?? chance.pickone([...periodModifiers]),
      uncertain: associations.uncertain ?? chance.bool(),
    }
  },
)

export const externalNumbersFactory = Factory.define<ExternalNumbers>(
  ({ associations, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      cdliNumber: associations.cdliNumber ?? chance.string(),
      bmIdNumber: associations.bmIdNumber ?? chance.string(),
      chicagoIsacNumber: associations.chicagoIsacNumber ?? chance.string(),
      archibabNumber: associations.archibabNumber ?? chance.string(),
      bdtnsNumber: associations.bdtnsNumber ?? chance.string(),
      rstiNumber: associations.rstiNumber ?? chance.string(),
      urOnlineNumber: associations.urOnlineNumber ?? chance.string(),
      hilprechtJenaNumber: associations.hilprechtJenaNumber ?? chance.string(),
      hilprechtHeidelbergNumber:
        associations.hilprechtHeidelbergNumber ?? chance.string(),
      metropolitanNumber: associations.metropolitanNumber ?? chance.string(),
      pierpontMorganNumber:
        associations.pierpontMorganNumber ?? chance.string(),
      achemenetNumber: associations.achemenetNumber ?? chance.string(),
      nabuccoNumber: associations.nabuccoNumber ?? chance.string(),
      digitaleKeilschriftBibliothekNumber:
        associations.digitaleKeilschriftBibliothekNumber ?? chance.string(),
      louvreNumber: associations.louvreNumber ?? chance.string(),
      ontarioNumber: associations.ontarioNumber ?? chance.string(),
      kelseyNumber: associations.kelseyNumber ?? chance.string(),
      harvardHamNumber: associations.harvardHamNumber ?? chance.string(),
      etcsriNumber: associations.etcsriNumber ?? chance.string(),
      sketchfabNumber: associations.sketchfabNumber ?? chance.string(),
      arkNumber: associations.arkNumber ?? chance.string(),
      dublinTcdNumber: associations.dublinTcdNumber ?? chance.string(),
      cambridgeMaaNumber: associations.cambridgeMaaNumber ?? chance.string(),
      ashmoleanNumber: associations.ashmoleanNumber ?? chance.string(),
      alalahHpmNumber: associations.alalahHpmNumber ?? chance.string(),
      australianinstituteofarchaeologyNumber:
        associations.australianinstituteofarchaeologyNumber ?? chance.string(),
      philadelphiaNumber: associations.philadelphiaNumber ?? chance.string(),
      yalePeabodyNumber: associations.yalePeabodyNumber ?? chance.string(),
      spurlockNumber: associations.spurlockNumber ?? chance.string(),
    }
  },
)

export const folioPagerEntryFactory = Factory.define<FragmentAndFolio>(() => ({
  fragmentNumber: defaultChance.string(),
  folioNumber: defaultChance.string(),
}))

export const folioPagerFactory = Factory.define<FolioPagerData>(
  ({ associations }) => ({
    previous: associations.previous ?? folioPagerEntryFactory.build(),
    next: associations.next ?? folioPagerEntryFactory.build(),
  }),
)

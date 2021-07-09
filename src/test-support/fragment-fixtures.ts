import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  Fragment,
  FragmentInfo,
  Join,
  Measures,
  RecordEntry,
  UncuratedReference,
} from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import Museum from 'fragmentarium/domain/museum'
import complexText from './complexTestText'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import { referenceFactory } from './bibliography-fixtures'
import { FolioPagerData, FragmentAndFolio } from 'fragmentarium/domain/pager'

const chance = new Chance()

function date(): string {
  return chance.date().toISOString()
}

function dateRange(): string {
  return `${date()}/${date()}`
}

function description(): string {
  return `${chance.sentence()}\n${chance.sentence()}`
}

function collection(): string {
  return chance.pickone([
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
    'Lagash',
    'Assur',
    'Huzirina',
  ])
}

function script(): string {
  return chance.pickone(['NA', 'NB'])
}

export const statisticsFactory = Factory.define<{
  transliteratedFragments: number
  lines: number
}>(() => ({
  transliteratedFragments: chance.natural(),
  lines: chance.natural(),
}))

class RecordFactory extends Factory<RecordEntry> {
  historical(date: string | null = null) {
    return this.params({
      date: date ?? dateRange(),
      type: 'HistoricalTransliteration',
    })
  }
}

export const recordFactory = RecordFactory.define(
  () =>
    new RecordEntry({
      user: chance.last(),
      date: date(),
      type: chance.pickone(['Transliteration', 'Collation', 'Revision']),
    })
)

export const measuresFactory = Factory.define<Measures>(() => ({
  length: chance.floating({ min: 0, max: 100 }),
  width: chance.floating({ min: 0, max: 100 }),
  thickness: chance.floating({ min: 0, max: 100 }),
}))

export const folioFactory = Factory.define<Folio>(
  () =>
    new Folio({
      name: chance.pickone(['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
      number: chance.string(),
    })
)

export const uncuratedReferenceFactory = Factory.define<UncuratedReference>(
  () => ({
    document: chance.sentence(),
    pages: chance.n(chance.natural, 5),
  })
)

export const joinFactory = Factory.define<Join>(({ sequence }) => ({
  museumNumber: `X.${sequence}`,
  isChecked: chance.bool(),
  joinedBy: chance.last(),
  date: chance.sentence(),
  note: chance.sentence(),
  legacyData: chance.sentence(),
}))

export const fragmentFactory = Factory.define<Fragment>(({ associations }) => {
  const museumNumber = chance.word()
  return new Fragment(
    museumNumber,
    chance.word(),
    chance.word(),
    chance.word(),
    chance.sentence({ words: 4 }),
    associations.joins ?? [
      [joinFactory.build({ museumNumber })],
      [joinFactory.build()],
    ],
    description(),
    associations.measures ?? measuresFactory.build(),
    collection(),
    script(),
    associations.folios ?? folioFactory.buildList(2),
    associations.record ?? recordFactory.buildList(2),
    associations.text ?? complexText,
    chance.sentence(),
    associations.museum ?? Museum.of('The British Museum'),
    associations.references ?? referenceFactory.buildList(2),
    associations.uncuratedReferences ?? null,
    '',
    chance.bool(),
    associations.genres ??
      chance.pickone([
        new Genres([
          new Genre(['ARCHIVE', 'Administrative', 'Lists'], false),
          new Genre(['Other', 'Fake', 'Certain'], false),
        ]),
        new Genres([new Genre(['Other', 'Fake', 'Certain'], false)]),
      ])
  )
})

export const fragmentInfoFactory = Factory.define<FragmentInfo>(
  ({ associations }) => ({
    number: chance.word(),
    accession: chance.word(),
    description: description(),
    script: script(),
    matchingLines: associations.matchingLines ?? [['1. kur']],
    editor: chance.last(),
    date: date(),
    // eslint-disable-next-line camelcase
    edition_date: date(),
    references: associations.references ?? [],
  })
)

export const folioPagerEntryFactory = Factory.define<FragmentAndFolio>(() => ({
  fragmentNumber: chance.string(),
  folioNumber: chance.string(),
}))

export const folioPagerFactory = Factory.define<FolioPagerData>(
  ({ associations }) => ({
    previous: associations.previous ?? folioPagerEntryFactory.build(),
    next: associations.next ?? folioPagerEntryFactory.build(),
  })
)

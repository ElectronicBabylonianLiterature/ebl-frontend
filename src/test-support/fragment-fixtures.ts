import { factory } from 'factory-girl'
import { Chance } from 'chance'
import { Fragment, RecordEntry } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import Museum from 'fragmentarium/domain/museum'
import complexText from './complexTestText'

const chance = new Chance()

function date(): string {
  return factory.chance('date')().toISOString()
}

function dateRange(): string {
  return `${date()}/${date()}`
}

async function description(): Promise<string> {
  return `${await factory.chance('sentence')()}\n${await factory.chance(
    'sentence'
  )()}`
}

factory.define('statistics', Object, {
  transliteratedFragments: factory.chance('natural'),
  lines: factory.chance('natural'),
})

factory.define('record', RecordEntry, {
  user: factory.chance('last'),
  date: date,
  type: factory.chance('pickone', ['Transliteration', 'Collation', 'Revision']),
})

factory.extend('record', 'historicalRecord', {
  date: dateRange,
  type: 'HistoricalTransliteration',
})

factory.define('measures', Object, {
  length: factory.chance('floating', { min: 0, max: 100 }),
  width: factory.chance('floating', { min: 0, max: 100 }),
  thickness: factory.chance('floating', { min: 0, max: 100 }),
})

factory.define('folio', Folio, {
  name: factory.chance('pickone', ['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
  number: factory.chance('string'),
})

factory.define('uncuratedReference', Object, {
  document: factory.chance('sentence'),
  lines: async () => await factory.chance('n', chance.natural, 5)(),
})

factory.define('fragment', Fragment, {
  number: factory.chance('word'),
  cdliNumber: factory.chance('word'),
  bmIdNumber: factory.chance('word'),
  accession: factory.chance('word'),
  publication: factory.chance('sentence', { words: 4 }),
  joins: async () => [await factory.chance('word')()],
  description: description,
  measures: factory.assocAttrs('measures'),
  collection: factory.chance('pickone', [
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
  ]),
  script: factory.chance('pickone', ['NA', 'NB']),
  folios: async () => await factory.buildMany('folio', 2),
  record: async () => await factory.buildMany('record', 2),
  text: complexText,
  notes: factory.chance('sentence'),
  museum: Museum.of('The British Museum'),
  references: async () => await factory.buildMany('referenceDto', 2),
  hasPhoto: factory.chance('bool'),
  genre: factory.chance('pickone', [
    [['ARCHIVE', 'Administrative', 'Lists'], ['Canonical']],
    [['Other', 'Fake', 'Certain']],
  ]),
})

factory.define('fragmentInfo', Object, {
  number: factory.chance('word'),
  accession: factory.chance('word'),
  description: description,
  script: factory.chance('pickone', ['NA', 'NB']),
  matchingLines: [['1. kur']],
  editor: factory.chance('last'),
  date: date,
})

factory.define('folioPagerEntry', Object, {
  fragmentNumber: factory.chance('string'),
  folioNumber: factory.chance('string'),
})

factory.define('folioPager', Object, {
  previous: factory.assocAttrs('folioPagerEntry'),
  next: factory.assocAttrs('folioPagerEntry'),
})

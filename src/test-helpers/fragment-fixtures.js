import { factory } from 'factory-girl'
import { Chance } from 'chance'
import FactoryAdapter from './FactoryAdapter'
import { Fragment, RecordEntry, Folio } from 'fragmentarium/fragment'
import { Text } from 'fragmentarium/text'
import Museum from 'fragmentarium/museum'

const chance = new Chance()

function date() {
  return factory
    .chance('date')()
    .toISOString()
}

function dateRange() {
  return `${date()}/${date()}`
}

factory.define('statistics', Object, {
  transliteratedFragments: factory.chance('natural'),
  lines: factory.chance('natural')
})

factory.define('record', RecordEntry, {
  user: factory.chance('last'),
  date: date,
  type: factory.chance('pickone', ['Transliteration', 'Collation', 'Revision'])
})

factory.extend('record', 'historicalRecord', {
  date: dateRange,
  type: 'HistoricalTransliteration'
})

factory.define('measures', Object, {
  length: factory.chance('floating', { min: 0, max: 100 }),
  width: factory.chance('floating', { min: 0, max: 100 }),
  thickness: factory.chance('floating', { min: 0, max: 100 })
})

factory.define('folio', Folio, {
  name: factory.chance('pickone', ['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
  number: factory.chance('string')
})

factory.define('textLine', Object, {
  prefix: async () => `${await factory.chance('natural')}.`,
  content: [
    {
      type: 'Token',
      value: factory.chance('pickone', ['[...]', '&', '&1'])
    },
    {
      type: 'Word',
      value: factory.chance('pickone', ['x', 'X', 'ia', 'g[u/gem[e₂]']),
      uniqueLemma: [],
      normalized: factory.chance('bool'),
      language: factory.chance('pickone', ['AKKADIAN', 'SUMERIAN']),
      lemmatizable: factory.chance('bool')
    }
  ],
  type: 'TextLine'
})

factory.define('emptyLine', Object, {
  type: 'EmptyLine',
  prefix: '',
  content: []
})

factory.define('controlLine', Object, {
  prefix: factory.chance('pickone', ['$', '#', '&']),
  content: [
    {
      type: 'Token',
      value: factory.chance('word')
    }
  ],
  type: 'ControlLine'
})

factory.define('text', Text, {
  lines: async () => {
    return [
      await factory.build('controlLine'),
      await factory.build('textLine'),
      await factory.build('emptyLine'),
      await factory.build('controlLine'),
      await factory.build('textLine'),
      await factory.build('textLine'),
      await factory.build('textLine')
    ]
  }
})

factory.define('uncuratedReference', Object, {
  document: factory.chance('sentence'),
  lines: async () => await factory.chance('n', chance.natural, 5)()
})

factory.define('fragment', Fragment, {
  number: factory.chance('word'),
  cdliNumber: factory.chance('word'),
  bmIdNumber: factory.chance('word'),
  accession: factory.chance('word'),
  publication: factory.chance('sentence', { words: 4 }),
  joins: async () => [await factory.chance('word')()],
  description: async () =>
    `${await factory.chance('sentence')()}\n${await factory.chance(
      'sentence'
    )()}`,
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
    'Huzirina'
  ]),
  script: factory.chance('pickone', ['NA', 'NB']),
  folios: async () => await factory.buildMany('folio', 2),
  record: async () => await factory.buildMany('record', 2),
  text: factory.assocAttrs('text'),
  notes: factory.chance('sentence'),
  museum: Museum.of('The British Museum'),
  references: async () => await factory.buildMany('referenceDto', 2),
  hasPhoto: factory.chance('bool')
})

factory.define('fragmentInfo', Object, {
  number: factory.chance('word'),
  accession: factory.chance('word'),
  description: async () =>
    `${await factory.chance('sentence')()}\n${await factory.chance(
      'sentence'
    )()}`,
  script: factory.chance('pickone', ['NA', 'NB']),
  matchingLines: [['1. kur']],
  editor: factory.chance('last'),
  date: date
})

factory.define('folioPagerEntry', Object, {
  fragmentNumber: factory.chance('string'),
  folioNumber: factory.chance('string')
})

factory.define('folioPager', Object, {
  previous: factory.assocAttrs('folioPagerEntry'),
  next: factory.assocAttrs('folioPagerEntry')
})

import { factory } from 'factory-girl'
import { fromJS, List } from 'immutable'
import { Chance } from 'chance'
import FactoryAdapter from './FactoryAdapter'
import {
  Fragment,
  Measures,
  RecordEntry,
  Line,
  Text,
  Folio,
  UncuratedReference
} from 'fragmentarium/fragment'

const chance = new Chance()

function date () {
  return factory
    .chance('date')()
    .toISOString()
}

function dateRange () {
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

factory.define('measures', Measures, {
  length: factory.chance('floating', { min: 0, max: 100 }),
  width: factory.chance('floating', { min: 0, max: 100 }),
  thickness: factory.chance('floating', { min: 0, max: 100 })
})
factory.setAdapter(new FactoryAdapter(), 'measures')

factory.define('folio', Folio, {
  name: factory.chance('pickone', ['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
  number: factory.chance('string')
})

factory.define('textLine', Line, {
  prefix: async () => `${await factory.chance('natural')}.`,
  content: fromJS([
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
  ]),
  type: 'TextLine'
})
factory.setAdapter(new FactoryAdapter(), 'textLine')

factory.define('emptyLine', Line, {
  type: 'EmptyLine',
  prefix: '',
  content: List()
})
factory.setAdapter(new FactoryAdapter(), 'emptyLine')

factory.define('controlLine', Line, {
  prefix: factory.chance('pickone', ['$', '#', '&']),
  content: fromJS([
    {
      type: 'Token',
      value: factory.chance('word')
    }
  ]),
  type: 'ControlLine'
})
factory.setAdapter(new FactoryAdapter(), 'controlLine')

factory.define('text', Text, {
  lines: async () => {
    return List([
      await factory.build('controlLine'),
      await factory.build('textLine'),
      await factory.build('emptyLine'),
      await factory.build('controlLine'),
      await factory.build('textLine'),
      await factory.build('textLine'),
      await factory.build('textLine')
    ])
  }
})

factory.define('uncuratedReference', UncuratedReference, {
  document: factory.chance('sentence'),
  lines: async () => List(await factory.chance('n', chance.email, 5)())
})

factory.define('fragment', Fragment, {
  number: factory.chance('word'),
  cdliNumber: factory.chance('word'),
  bmIdNumber: factory.chance('word'),
  accession: factory.chance('word'),
  publication: factory.chance('sentence', { words: 4 }),
  joins: async () => List([await factory.chance('word')()]),
  description: async () =>
    `${await factory.chance('sentence')()}\n${await factory.chance(
      'sentence'
    )()}`,
  measures: factory.assocAttrs('measures'),
  collection: 'Kuyunjik',
  script: factory.chance('pickone', ['NA', 'NB']),
  folios: async () => List(await factory.buildMany('folio', 2)),
  record: async () => List(await factory.buildMany('record', 2)),
  text: factory.assocAttrs('text'),
  notes: factory.chance('sentence'),
  museum: 'The British Museum',
  references: async () =>
    List(await factory.buildMany('referenceDto', 2)).map(dto => fromJS(dto))
})

factory.define('folioPagerEntry', Object, {
  fragmentNumber: factory.chance('string'),
  folioNumber: factory.chance('string')
})

factory.define('folioPager', Object, {
  previous: factory.assocAttrs('folioPagerEntry'),
  next: factory.assocAttrs('folioPagerEntry')
})

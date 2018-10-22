import { factory } from 'factory-girl'
import createFolio from 'fragmentarium/createFolio'

factory.define('statistics', Object, {
  transliteratedFragments: factory.chance('natural'),
  lines: factory.chance('natural')
})

factory.define('record', Object, {
  user: factory.chance('email'),
  date: () => factory.chance('date')().toISOString(),
  type: factory.chance('pickone', ['Transliteration', 'Collation', 'Revision'])
})

factory.define('historicalRecord', Object, {
  user: factory.chance('email'),
  date: async () => `${await factory.chance('date')().toISOString()}/${await factory.chance('date')().toISOString()}`,
  type: 'HistoricalTransliteration'
})

factory.define('measure', Object, {
  value: factory.chance('floating', { min: 0, max: 100 }),
  note: factory.chance('sentence')
})

factory.define('folioDto', Object, {
  name: factory.chance('pickone', ['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
  number: factory.chance('string')
})

factory.define('folio', Object, async ({ name, number }) => {
  const dto = await factory.build('folioDto')
  return createFolio(name || dto.name, number || dto.number)
})

factory.define('fragmentDto', Object, {
  '_id': factory.chance('word'),
  'cdliNumber': factory.chance('word'),
  'bmIdNumber': factory.chance('word'),
  'accession': factory.chance('word'),
  'genre': factory.chance('sentence', { words: 2 }),
  'fincke': factory.chance('sentence'),
  'publication': factory.chance('sentence', { words: 4 }),
  'joins': [
    factory.chance('word')
  ],
  'subcollection': factory.chance('sentence', { words: 2 }),
  'description': factory.chance('sentence'),
  'length': factory.assocAttrs('measure'),
  'width': factory.assocAttrs('measure'),
  'thickness': factory.assocAttrs('measure'),
  'collection': 'Kuyunjik',
  'script': factory.chance('pickone', ['NA', 'NB']),
  'date': factory.chance('sentence', { words: 2 }),
  'folios': factory.assocAttrsMany('folioDto', 2),
  'record': factory.assocAttrsMany('record', 2),
  'transliteration': factory.chance('paragraph'),
  'notes': factory.chance('sentence'),
  'museum': 'The British Museum'
})

factory.define('fragment', Object, async () => {
  const dto = await factory.build('fragmentDto')
  return {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number))
  }
})

factory.define('folioPagerEntry', Object, {
  fragmentNumber: factory.chance('string'),
  folioNumber: factory.chance('string')
})

factory.define('folioPager', Object, {
  previous: factory.assocAttrs('folioPagerEntry'),
  next: factory.assocAttrs('folioPagerEntry')
})

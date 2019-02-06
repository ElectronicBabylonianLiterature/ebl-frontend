import { factory } from 'factory-girl'
import createFolio from 'fragmentarium/createFolio'
import createFragment from 'fragmentarium/createFragment'

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

factory.define('textLineDto', Object, {
  'prefix': async () => `${await factory.chance('natural')}.`,
  'content': [
    {
      'type': 'Token',
      'value': factory.chance('pickone', ['[...]', '&', '&1'])
    },
    {
      'type': 'Word',
      'value': factory.chance('pickone', ['x', 'X', 'ia', 'g[u/gem[e₂]']),
      'uniqueLemma': [],
      'normalized': factory.chance('bool'),
      'language': factory.chance('pickone', ['AKKADIAN', 'SUMERIAN']),
      'lemmatizable': factory.chance('bool')
    }
  ],
  'type': 'TextLine'
})

factory.define('emptyLineDto', Object, {
  'type': 'EmptyLine',
  'prefix': '',
  'content': []
})

factory.define('controlLineDto', Object, {
  'prefix': factory.chance('pickone', ['$', '#', '&']),
  'content': [
    {
      'type': 'Token',
      'value': factory.chance('word')
    }
  ],
  'type': 'ControlLine'
})

factory.define('textDto', Object, {
  lines: async () => {
    return [
      await factory.build('controlLineDto'),
      await factory.build('textLineDto'),
      await factory.build('emptyLineDto'),
      await factory.build('controlLineDto'),
      await factory.build('textLineDto'),
      await factory.build('textLineDto'),
      await factory.build('textLineDto')
    ]
  }
})

factory.define('reference', Object, {
  id: factory.chance('string'),
  type: factory.chance('pickone', ['EDITION', 'DISCUSSION', 'COPY', 'PHOTO']),
  pages: async () => `${await factory.chance('natural')()}-${await factory.chance('natural')()}`,
  notes: factory.chance('string'),
  linesCited: factory.chance('pickset', ['1.', '2.', '3\'.', '4\'.2.'], 2)
})

factory.extend('reference', 'hydratedReference', {
  'document': factory.assocAttrs('bibliographyEntry')
})

factory.define('fragmentDto', Object, {
  '_id': factory.chance('word'),
  'cdliNumber': factory.chance('word'),
  'bmIdNumber': factory.chance('word'),
  'accession': factory.chance('word'),
  'publication': factory.chance('sentence', { words: 4 }),
  'joins': [
    factory.chance('word')
  ],
  'description': async () => `${
    await factory.chance('sentence')()
  }\n${
    await factory.chance('sentence')()
  }`,
  'length': factory.assocAttrs('measure'),
  'width': factory.assocAttrs('measure'),
  'thickness': factory.assocAttrs('measure'),
  'collection': 'Kuyunjik',
  'script': factory.chance('pickone', ['NA', 'NB']),
  'folios': factory.assocAttrsMany('folioDto', 2),
  'record': factory.assocAttrsMany('record', 2),
  'text': factory.assocAttrs('textDto'),
  'notes': factory.chance('sentence'),
  'museum': 'The British Museum',
  'references': factory.assocAttrsMany('reference', 2)
})

factory.define('fragment', Object, async () => {
  const dto = await factory.build('fragmentDto')
  return createFragment(dto)
})

factory.define('hydratedFragment', Object, async () => {
  const dto = await factory.build('fragmentDto')
  return {
    ...createFragment(dto),
    'references': await factory.assocAttrsMany('hydratedReference', 2)
  }
})

factory.extend('fragment', 'hydratedFragment_', {
  'references': factory.assocAttrsMany('hydratedReference', 2)
})

factory.define('folioPagerEntry', Object, {
  fragmentNumber: factory.chance('string'),
  folioNumber: factory.chance('string')
})

factory.define('folioPager', Object, {
  previous: factory.assocAttrs('folioPagerEntry'),
  next: factory.assocAttrs('folioPagerEntry')
})

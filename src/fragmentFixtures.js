import {factory} from 'factory-girl'

factory.define('record', Object, {
  user: factory.chance('email'),
  date: () => factory.chance('date')().toISOString(),
  type: factory.chance('pickone', ['Transliteration', 'Collation'])
})

factory.define('fragment', Object, {
  '_id': factory.chance('word'),
  'cdliNumber': factory.chance('word'),
  'bmIdNumber': factory.chance('word'),
  'accession': factory.chance('word'),
  'genre': factory.chance('sentence', {words: 2}),
  'fincke': factory.chance('sentence'),
  'publication': factory.chance('sentence', {words: 4}),
  'joins': [
    factory.chance('word')
  ],
  'subcollection': factory.chance('sentence', {words: 2}),
  'description': factory.chance('sentence'),
  'length': '13,3',
  'width': '5,0 (complete)',
  'thickness': '2,7 (incomplete)',
  'collection': 'Kuyunjik',
  'script': factory.chance('pickone', ['NA', 'NB']),
  'date': factory.chance('sentence', {words: 2}),
  'folio': [
    factory.chance('word'),
    factory.chance('word')
  ],
  'record': factory.assocAttrsMany('record', 2),
  'transliteration': factory.chance('paragraph'),
  'notes': factory.chance('sentence'),
  'museum': 'The British Museum'
})

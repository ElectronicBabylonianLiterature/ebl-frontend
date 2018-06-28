import {factory} from 'factory-girl'

function wordArray () {
  return [
    factory.chance('word'),
    factory.chance('word')
  ]
}

factory.define('form', Object, {
  attested: false,
  lemma: wordArray(),
  notes: wordArray()
})

factory.define('vowels', Object, {
  value: [
    factory.chance('character'),
    factory.chance('character')
  ],
  notes: wordArray()
})

factory.define('entry', Object, {
  meaning: factory.chance('sentence'),
  vowels: factory.assocAttrsMany('vowels', 2)
})

factory.extend('entry', 'amplifiedMeaning', {
  key: factory.chance('character'),
  entries: factory.assocAttrsMany('entry', 2)
})

factory.define('derived', Object, {
  lemma: wordArray(),
  homonym: 'I',
  notes: wordArray()
})

factory.define('logogram', Object, {
  logogram: wordArray(),
  notes: wordArray()
})

factory.define('word', Object, {
  _id: factory.chance('string'),
  attested: true,
  lemma: wordArray(),
  legacyLemma: factory.chance('word'),
  homonym: 'I',
  meaning: factory.chance('sentence'),
  pos: 'AJ',
  forms: factory.assocAttrsMany('form', 2),
  amplifiedMeanings: factory.assocAttrsMany('amplifiedMeaning', 2),
  logograms: factory.assocAttrsMany('logogram', 2),
  derived: [
    factory.assocAttrsMany('derived', 2),
    factory.assocAttrsMany('derived', 2)
  ],
  derivedFrom: factory.assocAttrs('derived'),
  source: '**source**'
})

import {factory} from 'factory-girl'

function pickOne (values) {
  return factory.chance('pickone', values)
}

function homonym () {
  return pickOne(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'])
}

function vowel () {
  return pickOne(['i', 'a', 'u', 'e'])
}

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
    vowel(),
    vowel()
  ],
  notes: wordArray()
})

factory.define('entry', Object, {
  meaning: factory.chance('sentence'),
  vowels: factory.assocAttrsMany('vowels', 2)
})

factory.extend('entry', 'amplifiedMeaning', {
  key: pickOne(['G', 'Gtn', 'Gt', 'D', 'Dtn', 'Dt', 'Dtt', 'Š', 'Štn', 'Št', 'ŠD', 'N', 'Ntn', 'R', 'Št2', 'A.', 'B.', 'C.', 'D.']),
  entries: factory.assocAttrsMany('entry', 2)
})

factory.define('derived', Object, {
  lemma: wordArray(),
  homonym: homonym(),
  notes: wordArray()
})

factory.define('logogram', Object, {
  logogram: factory.chance('pickset', ['alpha', 'bravo', 'charlie', 'delta', 'echo'], 2),
  notes: wordArray()
})

factory.define('word', Object, {
  _id: factory.chance('hash'),
  attested: true,
  lemma: wordArray(),
  legacyLemma: factory.chance('word'),
  homonym: homonym(),
  meaning: factory.chance('sentence'),
  pos: pickOne(['', 'AJ', 'AV', 'N', 'NU', 'DP', 'IP', 'PP', 'QP', 'RP', 'XP', 'REL', 'DET', 'CNJ', 'J', 'MOD', 'PRP', 'SBJ']),
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

factory.extend('word', 'verb', {
  pos: 'V',
  roots: ['rrr', 'ttt']
})

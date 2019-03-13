import { factory } from 'factory-girl'
import { fromJS, List } from 'immutable'
import _ from 'lodash'
import Folio from 'fragmentarium/createFolio'
import { Fragment, Measures, Measure, RecordEntry, Line, Text } from 'fragmentarium/fragment'

factory.define('statistics', Object, {
  transliteratedFragments: factory.chance('natural'),
  lines: factory.chance('natural')
})

factory.define('recordDto', Object, {
  user: factory.chance('email'),
  date: () => factory.chance('date')().toISOString(),
  type: factory.chance('pickone', ['Transliteration', 'Collation', 'Revision'])
})

factory.define('record', RecordEntry, {
  user: factory.chance('email'),
  date: () => factory.chance('date')().toISOString(),
  type: factory.chance('pickone', ['Transliteration', 'Collation', 'Revision'])
})

factory.define('historicalRecord', RecordEntry, {
  user: factory.chance('email'),
  date: async () => `${await factory.chance('date')().toISOString()}/${await factory.chance('date')().toISOString()}`,
  type: 'HistoricalTransliteration'
})

factory.define('measureDto', Object, {
  value: factory.chance('floating', { min: 0, max: 100 }),
  note: factory.chance('sentence')
})

factory.define('measure', Measure, {
  value: factory.chance('floating', { min: 0, max: 100 }),
  note: factory.chance('sentence')
})

factory.define('measures', Measures, {
  'length': factory.assocAttrs('measure'),
  'width': factory.assocAttrs('measure'),
  'thickness': factory.assocAttrs('measure')
})

factory.define('folioDto', Object, {
  name: factory.chance('pickone', ['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
  number: factory.chance('string')
})

factory.define('folio', Folio, {
  name: factory.chance('pickone', ['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
  number: factory.chance('string')
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
  'length': factory.assocAttrs('measureDto'),
  'width': factory.assocAttrs('measureDto'),
  'thickness': factory.assocAttrs('measureDto'),
  'collection': 'Kuyunjik',
  'script': factory.chance('pickone', ['NA', 'NB']),
  'folios': factory.assocAttrsMany('folioDto', 2),
  'record': factory.assocAttrsMany('recordDto', 2),
  'text': factory.assocAttrs('textDto'),
  'notes': factory.chance('sentence'),
  'museum': 'The British Museum',
  'references': factory.assocAttrsMany('referenceDto', 2)
})

factory.define('fragment', Fragment, async buildOptions => {
  const dto = await factory.build('fragmentDto')
  return {
    ...dto,
    number: dto._id,
    measures: new Measures(_(dto)
      .pick(['length', 'width', 'thickness'])
      .mapValues(measureDto => new Measure(measureDto))
      .value()
    ),
    folios: dto.folios.map(folioDto => new Folio(folioDto)),
    record: dto.record.map((recordEntryDto) => new RecordEntry(recordEntryDto)),
    text: new Text({ lines: List(dto.text.lines).map(lineDto => new Line(lineDto)) }),
    references: dto.references.map(reference => fromJS(reference)),
    matchingLines: dto.matching_lines
      ? dto.matching_lines.map(line => fromJS(line))
      : []
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

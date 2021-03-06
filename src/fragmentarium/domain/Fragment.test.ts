import _ from 'lodash'
import { Fragment, RecordEntry, UncuratedReference } from './fragment'
import Folio from './Folio'
import { Text } from 'transliteration/domain/text'
import {
  atEleven,
  atTen,
  atTwelve,
  historicalTransliteration,
  on21stDecember,
  on21thOctober,
  on22ndOctober,
  revision,
  revisionAtEleven,
  transliteration,
  transliterationAtElevenThirty,
  transliterationAtTen,
  userAlice,
  userBob,
  year2017,
  year2018,
} from 'test-support/record-fixtures'
import Museum from './museum'
import { LooseDollarLine } from 'transliteration/domain/dollar-lines'
import { Genres } from 'fragmentarium/domain/Genres'

const config = {
  number: 'K.1',
  cdliNumber: 'cdli.1',
  bmIdNumber: 'bm.1',
  accession: '1',
  publication: 'A journal',
  joins: ['K.2'],
  description: 'A clay tabled',
  measures: {
    length: 3,
    width: 5,
    thickness: 3.6,
  },
  collection: 'The collection',
  script: 'NA',
  folios: [new Folio({ name: 'AKG', number: '435' })],
  record: [
    new RecordEntry({
      user: 'Smith',
      date: '2018-11-21T10:27:36.127247',
      type: 'Transliteration',
    }),
  ],
  text: new Text({
    lines: [
      new LooseDollarLine({
        type: 'LooseDollarLine',
        text: 'atf',
        displayValue: '(atf)',
        prefix: '$',
        content: [
          {
            type: 'ValueToken',
            value: '(atf)',
            cleanValue: '(atf)',
            enclosureType: [],
          },
        ],
      }),
    ],
  }),
  notes: 'Some notes',
  museum: Museum.of('The museum'),
  references: [
    {
      id: 'RN1853',
      linesCited: [],
      notes: '',
      pages: '34-54',
      type: 'DISCUSSION',
    },
  ],
  uncuratedReferences: [
    {
      document: 'CAD 7',
      pages: [3, 208],
    },
  ],
  atf: '$ (atf)',
  hasPhoto: true,
  genres: Genres.fromJson([
    { category: ['ARCHIVAL', 'Administrative'], uncertain: false },
    { category: ['CATALOGUE', 'Memos'], uncertain: true },
  ]),
}

describe('Fragment', () => {
  const fragment = new Fragment(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(_.get(fragment, property)).toEqual(expected)
  })
})
test.each([
  [[{ document: 'CAD 7', pages: [] }], true],
  [[], true],
  [null, false],
] as [UncuratedReference[], boolean][])(
  'uncurated references: %s',
  (uncuratedReferences, expected) => {
    const fragment = new Fragment({ ...config, uncuratedReferences })
    expect(fragment.hasUncuratedReferences).toEqual(expected)
  }
)

test.each([
  [[atTen, atEleven, atTwelve], [atTen]],

  [
    [on21thOctober, on22ndOctober],
    [on21thOctober, on22ndOctober],
  ],

  [
    [on21thOctober, on21stDecember],
    [on21thOctober, on21stDecember],
  ],

  [
    [year2017, year2018],
    [year2017, year2018],
  ],

  [
    [userAlice, userBob],
    [userAlice, userBob],
  ],

  [
    [transliterationAtTen, revisionAtEleven, transliterationAtElevenThirty],
    [transliterationAtTen, revisionAtEleven, transliterationAtElevenThirty],
  ],

  [
    [historicalTransliteration, transliteration],
    [historicalTransliteration, transliteration],
  ],

  [
    [historicalTransliteration, revision],
    [historicalTransliteration, revision],
  ],
])('%s is filtered to %s', async (record, expected) => {
  const fragment = new Fragment({ ...config, record: record })
  expect(fragment.uniqueRecord).toEqual(expected)
})

test.each([
  ['P201033', 'P201033'],
  ['', 'X000001'],
])('ATF headind, cdli number: %s', (cdliNumber, expected) => {
  const fragment = new Fragment({ ...config, cdliNumber })
  expect(fragment.atfHeading).toEqual(`&${expected} = ${config.number}
#project: eblo
#atf: lang akk-x-stdbab
#atf: use unicode
#atf: use math
#atf: use legacy`)
})

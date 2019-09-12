// @flow
import { List, Map } from 'immutable'
import _ from 'lodash'
import { Folio, Fragment, RecordEntry, UncuratedReference } from './fragment'
import { Text } from './text'
import type { Measures, Line } from './fragment'
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
  year2018
} from '../test-helpers/record-fixtures'

describe('Fragment', () => {
  const config = {
    number: 'K.1',
    cdliNumber: 'cdli.1',
    bmIdNumber: 'bm.1',
    accession: '1',
    publication: 'A journal',
    joins: List(['K.2']),
    description: 'A clay tabled',
    measures: {
      length: 3,
      width: 5,
      thickness: 3.6
    },
    collection: 'The collection',
    script: 'NA',
    folios: List([new Folio({ name: 'AKG', number: '435' })]),
    record: List.of(
      new RecordEntry({
        user: 'Smith',
        date: '2018-11-21T10:27:36.127247',
        type: 'Transliteration'
      })
    ),
    text: new Text({
      lines: [
        {
          type: 'ControlLine',
          prefix: '$',
          content: [{ type: 'Token', value: '(atf)' }]
        }
      ]
    }),
    notes: 'Some notes',
    museum: 'The museum',
    references: List([
      Map({
        id: 'RN1853',
        linesCited: List(),
        notes: '',
        pages: '34-54',
        type: 'DISCUSSION'
      })
    ]),
    uncuratedReferences: List.of(
      UncuratedReference({
        document: 'CAD 7',
        pages: List.of(3, 208)
      })
    ),
    atf: '$ (atf)',
    matchingLines: List()
  }
  const fragment = new Fragment(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(fragment.get(property)).toEqual(expected)
  })
})

test.each([
  [List.of(UncuratedReference({ document: 'CAD 7', pages: List() })), true],
  [List(), true],
  [null, false]
])('uncurated references: %s', (uncuratedReferences, expected) => {
  const fragment = new Fragment({ uncuratedReferences })
  expect(fragment.hasUncuratedReferences).toEqual(expected)
})

test.each([
  [List.of(atTen, atEleven, atTwelve), List.of(atTen)],

  [
    List.of(on21thOctober, on22ndOctober),
    List.of(on21thOctober, on22ndOctober)
  ],

  [
    List.of(on21thOctober, on21stDecember),
    List.of(on21thOctober, on21stDecember)
  ],

  [List.of(year2017, year2018), List.of(year2017, year2018)],

  [List.of(userAlice, userBob), List.of(userAlice, userBob)],

  [
    List.of(
      transliterationAtTen,
      revisionAtEleven,
      transliterationAtElevenThirty
    ),
    List.of(
      transliterationAtTen,
      revisionAtEleven,
      transliterationAtElevenThirty
    )
  ],

  [
    List.of(historicalTransliteration, transliteration),
    List.of(historicalTransliteration, transliteration)
  ],

  [
    List.of(historicalTransliteration, revision),
    List.of(historicalTransliteration, revision)
  ]
])('%s is filtered to %s', (record, expected) => {
  const fragment = new Fragment({ record })
  expect(fragment.uniqueRecord).toEqual(expected)
})

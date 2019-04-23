
import { Map, List } from 'immutable'
import _ from 'lodash'
import Chance from 'chance'
import { Fragment, Measures, RecordEntry, Line, Text, UncuratedReference, Folio } from './fragment'

describe('Fragment', () => {
  const config = {
    number: 'K.1',
    cdliNumber: 'cdli.1',
    bmIdNumber: 'bm.1',
    accession: '1',
    publication: 'A journal',
    joins: List(['K.2']),
    description: 'A clay tabled',
    measures: Measures({
      length: 3,
      width: 5,
      thickness: 3.6
    }),
    collection: 'The collection',
    script: 'NA',
    folios: List([
      new Folio({ name: 'AKG', number: '435' })
    ]),
    record: List.of(
      RecordEntry({ user: 'Smith', date: '2018-11-21T10:27:36.127247', type: 'Transliteration' })
    ),
    text: Text({
      lines: List.of(Line({
        type: 'ControlLine',
        prefix: '$',
        content: List.of(Map({ type: 'Token', value: '(atf)' }))
      }))
    }),
    notes: 'Some notes',
    museum: 'The museum',
    references: List([Map({
      id: 'RN1853',
      linesCited: List(),
      notes: '',
      pages: '34-54',
      type: 'DISCUSSION'
    })]),
    uncuratedReferences: List.of(UncuratedReference({
      document: 'CAD 7',
      lines: List.of(3, 208)
    })),
    atf: '$ (atf)',
    matchingLines: List()
  }
  const fragment = new Fragment(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(fragment[property]).toEqual(expected)
  })
})

test.each([
  [List.of(UncuratedReference({ document: 'CAD 7', lines: List() })), true],
  [List(), true],
  [null, false]
])('uncurated references: %s', (uncuratedReferences, expected) => {
  const fragment = new Fragment({ uncuratedReferences })
  expect(fragment.hasUncuratedReferences).toEqual(expected)
})

const ten = RecordEntry({ user: 'SameDate', date: '2018-11-21T10:27:36.127247', type: 'Transliteration' })
const eleven = RecordEntry({ user: 'SameDate', date: '2018-11-21T11:27:36.127248', type: 'Transliteration' })
const twelve = RecordEntry({ user: 'SameDate', date: '2018-11-21T12:27:36.127248', type: 'Transliteration' })

const day21 = RecordEntry({ user: 'DiffDay', date: '2018-11-21T10:27:36.127247', type: 'Transliteration' })
const day22 = RecordEntry({ user: 'DiffDay', date: '2018-11-22T10:27:36.127247', type: 'Transliteration' })

const year2017 = RecordEntry({ user: 'DiffYear', date: '2017-11-21T10:27:36.127247', type: 'Transliteration' })
const year2018 = RecordEntry({ user: 'DiffYear', date: '2018-11-22T10:27:36.127247', type: 'Transliteration' })

const user1Ten = RecordEntry({ user: 'User1', date: '2018-11-21T10:27:36.127247', type: 'Transliteration' })
const user2Eleven = RecordEntry({ user: 'User2', date: '2018-11-21T11:00:36.127247', type: 'Review' })
const user1ElevenThirty = RecordEntry({ user: 'User2', date: '2018-11-21T11:30:36.127247', type: 'Transliteration' })

const historicalTransliteration = RecordEntry({ user: 'User1', date: '1998-01-17T10:50:36.127247/1999-04-17T10:29:39.127247', type: 'HistoricalTransliteration' })
const revision = RecordEntry({ user: 'User2', date: '1999-04-17T10:50:36.127247', type: 'Revision' })

test.each([
  [
    List.of(ten, eleven, twelve),
    List.of(ten)
  ],

  [
    List.of(day21, day22),
    List.of(day21, day22)
  ],

  [
    List.of(year2017, year2018),
    List.of(year2017, year2018)
  ],

  [
    List.of(user1Ten, user2Eleven, user1ElevenThirty),
    List.of(user1Ten, user2Eleven, user1ElevenThirty)
  ],

  [
    List.of(historicalTransliteration, revision),
    List.of(historicalTransliteration, revision)
  ]

])('%s is filtered to %s', (record, expected) => {
  const fragment = new Fragment({ record })
  expect(fragment.uniqueRecord).toEqual(expected)
})

describe('Folio', () => {
  const chance = new Chance()

  describe.each([
    ['Unknown', 'Unknown', false],
    ['WGL', 'Lambert', true],
    ['FWG', 'Geers', false],
    ['EL', 'Leichty', true],
    ['AKG', 'Grayson', true],
    ['MJG', 'Geller', true],
    ['WRM', 'Mayer', true]
  ])('%s folios', (name, humanized, hasImage) => {
    let number
    let folio

    beforeEach(() => {
      number = chance.string()
      folio = new Folio({ name, number })
    })

    test('Name', () => {
      expect(folio.name).toEqual(name)
    })

    test('Number', () => {
      expect(folio.number).toEqual(number)
    })

    test('Humanized name', () => {
      expect(folio.humanizedName).toEqual(humanized)
    })

    test('File name', () => {
      expect(folio.fileName).toEqual(`${name}_${number}.jpg`)
    })

    test('Has image', () => {
      expect(folio.hasImage).toEqual(hasImage)
    })
  })
})

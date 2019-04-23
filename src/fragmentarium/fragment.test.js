import { Map, List } from 'immutable'
import _ from 'lodash'
import Chance from 'chance'
import { Fragment, Measures, RecordEntry, Line, Text, UncuratedReference, Folio } from './fragment'
import Moment from 'moment'
import { extendMoment } from 'moment-range'

const moment = extendMoment(Moment)

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
      new RecordEntry({ user: 'Smith', date: '2018-11-21T10:27:36.127247', type: 'Transliteration' })
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

const historicalTransliteration = new RecordEntry({ user: 'User', date: '1998-01-17T10:50:36.127247/1999-04-17T10:29:39.127247', type: 'HistoricalTransliteration' })
const revision = new RecordEntry({ user: 'User', date: '1998-01-17T10:50:36.127247', type: 'Revision' })
const transliteration = new RecordEntry({ user: 'User', date: '1998-01-17T10:50:36.127247', type: 'Transliteration' })

const atTen = transliteration.set('user', 'Same Date').set('date', '2018-11-21T10:27:36.127247')
const atEleven = atTen.set('date', '2018-11-21T11:27:36.127248')
const atTwelve = atTen.set('date', '2018-11-21T12:27:36.127248')

const on21thOctober = transliteration.set('user', 'Different Day').set('date', '2018-11-21T10:27:36.127247')
const on22ndOctober = on21thOctober.set('date', '2018-11-22T10:27:36.127247')

const userBob = revision.set('user', 'Bob')
const userAlice = revision.set('user', 'Alice')

const year2017 = transliteration.set('user', 'Different Year').set('date', '2017-11-21T10:27:36.127247')
const year2018 = year2017.set('date', '2018-11-22T10:27:36.127247')

const transliterationAtTen = transliteration.set('user', 'Alternating Types').set('date', '2018-11-21T10:27:36.127247')
const revisionAtEleven = revision.set('user', 'Alternating Types').set('date', '2018-11-21T11:00:36.127247')
const transliterationAtElevenThirty = transliterationAtTen.set('date', '2018-11-21T11:30:36.127247')

describe('RecordEntry', () => {
  test.each([
    [atTen, atEleven, true],
    [on21thOctober, on22ndOctober, false],
    [userAlice, userBob, false],
    [year2017, year2018, false],
    [transliterationAtTen, revisionAtEleven, false],
    [historicalTransliteration, transliteration, false],
    [transliteration, revision, false],
    [historicalTransliteration, new RecordEntry({ user: 'User1', date: '1998-01-17T11:50:36.127247/1999-04-17T10:29:39.127247', type: 'HistoricalTransliteration' }), false],
    [historicalTransliteration, new RecordEntry({ user: 'User1', date: '1998-01-17T10:50:36.127247/1999-04-17T12:29:39.127247', type: 'HistoricalTransliteration' }), false],
    [historicalTransliteration, new RecordEntry({ user: 'User1', date: '1998-01-18T10:50:36.127247/1999-04-17T10:29:39.127247', type: 'HistoricalTransliteration' }), false],
    [historicalTransliteration, new RecordEntry({ user: 'User1', date: '1998-01-17T10:50:36.127247/1999-05-17T10:29:39.127247', type: 'HistoricalTransliteration' }), false]
  ])('%s dateEquals %s is %p', (first, second, expected) => {
    expect(first.dateEquals(second)).toBe(expected)
    expect(second.dateEquals(first)).toBe(expected)
  })

  test.each([
    [transliteration, moment(transliteration.date)],
    [revision, moment(revision.date)],
    [historicalTransliteration, moment.range(historicalTransliteration.date)]
  ])('%s.moment is %s', (recordEntry, expected) => {
    expect(recordEntry.moment).toEqual(expected)
  })

  test.each([
    [transliteration, false],
    [revision, false],
    [historicalTransliteration, true]
  ])('%s.isHistorical is %s', (recordEntry, expected) => {
    expect(recordEntry.isHistorical).toEqual(expected)
  })
})

test.each([
  [
    List.of(atTen, atEleven, atTwelve),
    List.of(atTen)
  ],

  [
    List.of(on21thOctober, on22ndOctober),
    List.of(on21thOctober, on22ndOctober)
  ],

  [
    List.of(year2017, year2018),
    List.of(year2017, year2018)
  ],

  [
    List.of(userAlice, userBob),
    List.of(userAlice, userBob)
  ],

  [
    List.of(transliterationAtTen, revisionAtEleven, transliterationAtElevenThirty),
    List.of(transliterationAtTen, revisionAtEleven, transliterationAtElevenThirty)
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

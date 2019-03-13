
import { Map, List } from 'immutable'
import _ from 'lodash'
import { Fragment, Measures, Measure, RecordEntry, Line, Text, UncuratedReference } from './fragment'
import Folio from 'fragmentarium/createFolio'

const config = {
  number: 'K.1',
  cdliNumber: 'cdli.1',
  bmIdNumber: 'bm.1',
  accession: '1',
  publication: 'A journal',
  joins: List(['K.2']),
  description: 'A clay tabled',
  measures: new Measures({
    length: new Measure({ value: 3 }),
    width: new Measure({ value: 5 }),
    thickness: new Measure({ value: 3.6 })
  }),
  collection: 'The collection',
  script: 'NA',
  folios: List([
    new Folio({ name: 'AKG', number: '435' })
  ]),
  record: List([
    new RecordEntry({ user: 'Smith', date: '2018-11-21T10:27:36.127247', type: 'Transliteration' })
  ]),
  text: new Text({
    lines: List([new Line({
      type: 'ControlLine',
      prefix: '$',
      content: List([Map({ type: 'Token', value: '(atf)' })])
    })])
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
  uncuratedReferences: List([new UncuratedReference({
    document: 'CAD 7',
    lines: List([3, 208])
  })]),
  hits: 0,
  atf: '$ (atf)',
  matchingLines: List()
}
const fragment = new Fragment(config)

test.each(_.toPairs(config))('%s', (property, expected) => {
  expect(fragment[property]).toEqual(expected)
})

import {
  Folio,
  Fragment,
  Line,
  Measures,
  RecordEntry,
  Text
} from '../fragmentarium/fragment'
import { List, Map } from 'immutable'

export const fragmentDto = {
  _id: 'Test.Fragment',
  accession: '',
  cdliNumber: '',
  bmIdNumber: '',
  publication: 'Electronic Babylonian Literature',
  description: 'A fragment to be used when testing the eBL application',
  joins: [],
  length: { value: 3.14, note: '(complete)' },
  width: { value: 0.30282212, note: '' },
  thickness: {},
  collection: '',
  script: 'NB',
  notes: '',
  museum: '',
  signs: 'SAL/P₂ ŠIM GU GA\nP₅/SAL ŠIM\nŠIM ŠIM\nKU KA GA KU X',
  record: [
    { user: 'Laasonen', type: 'Revision', date: '2019-02-01T14:22:40.201231' },
    { user: 'Laasonen', type: 'Revision', date: '2019-02-01T14:23:25.214166' }
  ],
  folios: [{ name: 'FWG', number: 'M134' }],
  text: {
    lines: [
      {
        prefix: '10.',
        content: [
          {
            type: 'Word',
            value: 'sal/:',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          },
          {
            type: 'Word',
            value: 'š[im',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          },
          {
            type: 'LoneDeterminative',
            value: '{gu}',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false,
            partial: [false, true]
          },
          { type: 'Token', value: '[...]' },
          {
            type: 'Word',
            value: '.GA',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          }
        ],
        type: 'TextLine'
      },
      {
        prefix: '10.',
        content: [
          {
            type: 'Word',
            value: '::/sal',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          },
          {
            type: 'Word',
            value: 'ši]m',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          }
        ],
        type: 'TextLine'
      },
      {
        prefix: '10.',
        content: [
          {
            type: 'Word',
            value: 'šim',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          },
          { type: 'Token', value: '|' },
          {
            type: 'Word',
            value: 'šim',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          }
        ],
        type: 'TextLine'
      },
      {
        prefix: '10.',
        content: [
          { type: 'Token', value: '...' },
          {
            type: 'Word',
            value: '+ku',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          },
          {
            type: 'LoneDeterminative',
            value: '{KA.G[A}',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false,
            partial: [false, false]
          },
          { type: 'Token', value: '...' },
          { type: 'Token', value: '...' },
          {
            type: 'Word',
            value: '.ku',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          },
          {
            type: 'Word',
            value: 'x',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          }
        ],
        type: 'TextLine'
      }
    ]
  },
  references: [
    { id: 'RN52', type: 'DISCUSSION', pages: '', notes: '', linesCited: [] }
  ],
  atf:
    '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x'
}

export const fragment = new Fragment({
  number: 'Test.Fragment',
  accession: '',
  cdliNumber: '',
  bmIdNumber: '',
  publication: 'Electronic Babylonian Literature',
  description: 'A fragment to be used when testing the eBL application',
  joins: List(),
  measures: Measures({
    length: 3.14,
    width: 0.30282212,
    thickness: null
  }),
  collection: '',
  script: 'NB',
  notes: '',
  museum: '',
  record: List.of(
    new RecordEntry({
      user: 'Laasonen',
      date: '2019-02-01T14:22:40.201231',
      type: 'Revision'
    }),
    new RecordEntry({
      user: 'Laasonen',
      date: '2019-02-01T14:23:25.214166',
      type: 'Revision'
    })
  ),
  folios: List([new Folio({ name: 'FWG', number: 'M134' })]),
  text: Text({
    lines: List.of(
      Line({
        type: 'TextLine',
        prefix: '10.',
        content: List.of(
          Map({
            type: 'Word',
            value: 'sal/:',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          }),
          Map({
            type: 'Word',
            value: 'š[im',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          }),
          Map({
            type: 'LoneDeterminative',
            value: '{gu}',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false,
            partial: List([false, true])
          }),
          Map({ type: 'Token', value: '[...]' }),
          Map({
            type: 'Word',
            value: '.GA',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          })
        )
      }),
      Line({
        type: 'TextLine',
        prefix: '10.',
        content: List.of(
          Map({
            type: 'Word',
            value: '::/sal',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          }),
          Map({
            type: 'Word',
            value: 'ši]m',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          })
        )
      }),
      Line({
        type: 'TextLine',
        prefix: '10.',
        content: List.of(
          Map({
            type: 'Word',
            value: 'šim',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          }),
          Map({ type: 'Token', value: '|' }),
          Map({
            type: 'Word',
            value: 'šim',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true
          })
        )
      }),
      Line({
        type: 'TextLine',
        prefix: '10.',
        content: List.of(
          Map({ type: 'Token', value: '...' }),
          Map({
            type: 'Word',
            value: '+ku',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          }),
          Map({
            type: 'LoneDeterminative',
            value: '{KA.G[A}',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false,
            partial: List([false, false])
          }),
          Map({ type: 'Token', value: '...' }),
          Map({ type: 'Token', value: '...' }),
          Map({
            type: 'Word',
            value: '.ku',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          }),
          Map({
            type: 'Word',
            value: 'x',
            uniqueLemma: List(),
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: false
          })
        )
      })
    )
  }),
  references: List([
    Map({
      id: 'RN52',
      type: 'DISCUSSION',
      pages: '',
      notes: '',
      linesCited: List()
    })
  ]),
  atf:
    '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x'
})

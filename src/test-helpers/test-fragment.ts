import { Folio, Fragment, RecordEntry } from 'fragmentarium/domain/fragment'
import { Text, Line } from 'fragmentarium/domain/text'
import Museum from 'fragmentarium/domain/museum'

const lines: readonly Line[] = [
  {
    type: 'TextLine',
    prefix: '10.',
    content: [
      {
        type: 'Word',
        value: 'sal/:',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      },
      {
        type: 'Word',
        value: 'š[im',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: []
      },
      {
        type: 'LoneDeterminative',
        value: '{gu}',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      },
      { type: 'UnknownNumberOfSigns', value: '[...]' },
      {
        type: 'Word',
        value: '.GA',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      }
    ]
  },
  {
    type: 'TextLine',
    prefix: '10.',
    content: [
      {
        type: 'Word',
        value: '::/sal',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      },
      {
        type: 'Word',
        value: 'ši]m',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: []
      }
    ]
  },
  {
    type: 'TextLine',
    prefix: '10.',
    content: [
      {
        type: 'Word',
        value: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: []
      },
      { type: 'Token', value: '|' },
      {
        type: 'Word',
        value: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: []
      }
    ]
  },
  {
    type: 'TextLine',
    prefix: '10.',
    content: [
      { type: 'UnknownNumberOfSigns', value: '...' },
      {
        type: 'Word',
        value: '+ku',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      },
      {
        type: 'LoneDeterminative',
        value: '{KA.G[A}',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      },
      { type: 'UnknownNumberOfSigns', value: '...' },
      { type: 'UnknownNumberOfSigns', value: '...' },
      {
        type: 'Word',
        value: '.ku',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      },
      {
        type: 'Word',
        value: 'x',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: []
      }
    ]
  }
]

export const fragmentDto = {
  _id: 'Test.Fragment',
  accession: '',
  cdliNumber: 'X0000',
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
  museum: 'The British Museum',
  signs: 'SAL/P₂ ŠIM GU GA\nP₅/SAL ŠIM\nŠIM ŠIM\nKU KA GA KU X',
  record: [
    { user: 'Laasonen', type: 'Revision', date: '2019-02-01T14:22:40.201231' },
    { user: 'Laasonen', type: 'Revision', date: '2019-02-01T14:23:25.214166' }
  ],
  folios: [{ name: 'FWG', number: 'M134' }],
  text: { lines },
  references: [
    { id: 'RN52', type: 'DISCUSSION', pages: '', notes: '', linesCited: [] }
  ],
  atf:
    '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x',
  hasPhoto: true
}

export const fragment = new Fragment({
  number: 'Test.Fragment',
  accession: '',
  cdliNumber: 'X0000',
  bmIdNumber: '',
  publication: 'Electronic Babylonian Literature',
  description: 'A fragment to be used when testing the eBL application',
  joins: [],
  measures: {
    length: 3.14,
    width: 0.30282212,
    thickness: null
  },
  collection: '',
  script: 'NB',
  notes: '',
  museum: Museum.of('The British Museum'),
  record: [
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
  ],
  folios: [new Folio({ name: 'FWG', number: 'M134' })],
  text: new Text({ lines }),
  references: [
    {
      id: 'RN52',
      type: 'DISCUSSION',
      pages: '',
      notes: '',
      linesCited: []
    }
  ],
  atf:
    '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x',
  hasPhoto: true
})

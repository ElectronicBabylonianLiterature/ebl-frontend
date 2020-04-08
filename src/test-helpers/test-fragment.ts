import { Folio, Fragment, RecordEntry } from 'fragmentarium/domain/fragment'
import { Text, Line } from 'fragmentarium/domain/text'
import Museum from 'fragmentarium/domain/museum'

const lines: readonly Line[] = [
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null
    },
    prefix: '10.',
    content: [
      {
        type: 'Word',
        value: 'sal/:',
        cleanValue: 'sal/:',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'Word',
        value: 'š[im',
        cleanValue: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'LoneDeterminative',
        value: '{gu}',
        cleanValue: '{gu}',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'UnknownNumberOfSigns',
        value: '[...]',
        cleanValue: '...',
        enclosureType: []
      },
      {
        type: 'Word',
        value: '.GA',
        cleanValue: '.GA',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      }
    ]
  },
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null
    },
    prefix: '10.',
    content: [
      {
        type: 'Word',
        value: '::/sal',
        cleanValue: '::/sal',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'Word',
        value: 'ši]m',
        cleanValue: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      }
    ]
  },
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null
    },
    prefix: '10.',
    content: [
      {
        type: 'Word',
        value: 'šim',
        cleanValue: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'ValueToken',
        value: '|',
        cleanValue: '|',
        enclosureType: []
      },
      {
        type: 'Word',
        value: 'šim',
        cleanValue: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      }
    ]
  },
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null
    },
    prefix: '10.',
    content: [
      {
        type: 'UnknownNumberOfSigns',
        value: '...',
        cleanValue: '...',
        enclosureType: []
      },
      {
        type: 'Word',
        value: '+ku',
        cleanValue: '+ku',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'LoneDeterminative',
        value: '{KA.G[A}',
        cleanValue: '{KA.GA}',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'UnknownNumberOfSigns',
        value: '...',
        cleanValue: '...',
        enclosureType: []
      },
      {
        type: 'UnknownNumberOfSigns',
        value: '...',
        cleanValue: '...',
        enclosureType: []
      },
      {
        type: 'Word',
        value: '.ku',
        cleanValue: '.ku',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
      },
      {
        type: 'Word',
        value: 'x',
        cleanValue: 'x',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: []
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

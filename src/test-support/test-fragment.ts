import { Fragment } from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import Folio from 'fragmentarium/domain/Folio'
import { Text } from 'transliteration/domain/text'
import { TextLineDto, TextLine } from 'transliteration/domain/text-line'
import Museum from 'fragmentarium/domain/museum'
import { Genres } from 'fragmentarium/domain/Genres'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { PeriodModifiers, Periods } from 'common/period'
import { MesopotamianDate } from 'chronology/domain/Date'

const externalNumbers = {
  cdliNumber: 'A38',
  bmIdNumber: 'W_1848-0720-117',
  archibabNumber: '42',
  bdtnsNumber: '99',
  urOnlineNumber: '123',
  hilprechtJenaNumber: '1235',
  hilprechtHeidelbergNumber: '11',
  achemenetNumber: '20',
  nabuccoNumber: '5',
  metropolitanNumber: '123',
  louvreNumber: '123',
  philadelphiaNumber: '123',
}

export const lines: readonly TextLineDto[] = [
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
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
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'Word',
        value: 'š[im',
        cleanValue: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        alignable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'LoneDeterminative',
        value: '{gu}',
        cleanValue: '{gu}',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'UnknownNumberOfSigns',
        value: '[...]',
        cleanValue: '...',
        enclosureType: [],
      },
      {
        type: 'Word',
        value: '.GA',
        cleanValue: '.GA',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
    ],
  },
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
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
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'Word',
        value: 'ši]m',
        cleanValue: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        alignable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
    ],
  },
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
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
        alignable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'ValueToken',
        value: '|',
        cleanValue: '|',
        enclosureType: [],
      },
      {
        type: 'Word',
        value: 'šim',
        cleanValue: 'šim',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        alignable: true,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
    ],
  },
  {
    type: 'TextLine',
    lineNumber: {
      type: 'LineNumber',
      number: 10,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
    },
    prefix: '10.',
    content: [
      {
        type: 'UnknownNumberOfSigns',
        value: '...',
        cleanValue: '...',
        enclosureType: [],
      },
      {
        type: 'Word',
        value: '+ku',
        cleanValue: '+ku',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'LoneDeterminative',
        value: '{KA.G[A}',
        cleanValue: '{KA.GA}',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'UnknownNumberOfSigns',
        value: '...',
        cleanValue: '...',
        enclosureType: [],
      },
      {
        type: 'UnknownNumberOfSigns',
        value: '...',
        cleanValue: '...',
        enclosureType: [],
      },
      {
        type: 'Word',
        value: '.ku',
        cleanValue: '.ku',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
      {
        type: 'Word',
        value: 'x',
        cleanValue: 'x',
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: false,
        alignable: false,
        erasure: 'NONE',
        parts: [],
        enclosureType: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        hasOmittedAlignment: false,
      },
    ],
  },
]

export const fragmentDto: FragmentDto = {
  museumNumber: {
    prefix: 'Test',
    number: 'Fragment',
    suffix: '',
  },
  accession: {
    prefix: 'A',
    number: '38',
    suffix: 'b',
  },
  publication: 'electronic Babylonian Library',
  description: 'A fragment to be used when testing the eBL application',
  joins: [
    [
      {
        museumNumber: {
          prefix: 'Test',
          number: 'Fragment',
          suffix: '',
        },
        isChecked: true,
        joinedBy: '',
        date: '',
        note: '',
        legacyData: '',
        isInFragmentarium: true,
      },
    ],
    [
      {
        museumNumber: {
          prefix: 'X',
          number: '2',
          suffix: 'b',
        },
        isChecked: false,
        joinedBy: '',
        date: '',
        note: '',
        legacyData: '',
        isInFragmentarium: false,
      },
    ],
  ],
  length: { value: 3.14, note: '(complete)' },
  width: { value: 0.30282212, note: '' },
  thickness: {},
  collection: '',
  legacyScript: 'NB',
  notes: {
    text: 'Note text',
    parts: [{ type: 'StringPart', text: 'Note text' }],
  },
  museum: 'The British Museum',
  signs: 'SAL/P₂ ŠIM GU GA\nP₅/SAL ŠIM\nŠIM ŠIM\nKU KA GA KU X',
  record: [
    { user: 'Laasonen', type: 'Revision', date: '2019-02-01T14:22:40.201231' },
    { user: 'Laasonen', type: 'Revision', date: '2019-02-01T14:23:25.214166' },
  ],
  folios: [{ name: 'FWG', number: 'M134' }],
  text: { lines },
  references: [
    {
      id: 'RN52',
      type: 'DISCUSSION',
      pages: '',
      notes: '',
      linesCited: [],
      document: { id: 'RN52' },
    },
  ],
  uncuratedReferences: null,
  traditionalReferences: ['text 1'],
  atf:
    '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x',
  hasPhoto: true,
  genres: [
    {
      category: ['ARCHIVE', 'Administrative', 'Lists'],
      uncertain: false,
    },
  ],
  introduction: {
    text: 'Introduction',
    parts: [{ type: 'StringPart', text: 'Introduction' }],
  },
  script: {
    period: Periods['Late Babylonian'].name,
    periodModifier: PeriodModifiers.None.name,
    uncertain: false,
  },
  externalNumbers,
  projects: [],
  date: {
    year: { value: '1' },
    month: { value: '1' },
    day: { value: '1' },
    isSeleucidEra: true,
  },
  datesInText: [
    {
      year: { value: '1' },
      month: { value: '1' },
      day: { value: '1' },
      isSeleucidEra: true,
    },
  ],
}

export const fragment = new Fragment(
  'Test.Fragment',
  'A.38.b',
  'electronic Babylonian Library',
  [
    [
      {
        museumNumber: 'Test.Fragment',
        isChecked: true,
        joinedBy: '',
        date: '',
        note: '',
        legacyData: '',
        isInFragmentarium: true,
      },
    ],
    [
      {
        museumNumber: 'X.2.b',
        isChecked: false,
        joinedBy: '',
        date: '',
        note: '',
        legacyData: '',
        isInFragmentarium: false,
      },
    ],
  ],
  'A fragment to be used when testing the eBL application',
  {
    length: 3.14,
    width: 0.30282212,
    thickness: null,
  },
  '',
  'NB',
  [new Folio({ name: 'FWG', number: 'M134' })],
  [
    new RecordEntry({
      user: 'Laasonen',
      date: '2019-02-01T14:22:40.201231',
      type: 'Revision',
    }),
    new RecordEntry({
      user: 'Laasonen',
      date: '2019-02-01T14:23:25.214166',
      type: 'Revision',
    }),
  ],
  new Text({ lines: lines.map((lineDto) => new TextLine(lineDto)) }),
  {
    text: 'Note text',
    parts: [{ type: 'StringPart', text: 'Note text' }],
  },
  Museum.of('The British Museum'),
  [
    new Reference(
      'DISCUSSION',
      '',
      '',
      [],
      new BibliographyEntry({ id: 'RN52' })
    ),
  ],
  null,
  ['text 1'],
  '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x',
  true,
  Genres.fromJson([
    {
      category: ['ARCHIVE', 'Administrative', 'Lists'],
      uncertain: false,
    },
  ]),
  {
    text: 'Introduction',
    parts: [{ text: 'Introduction', type: 'StringPart' }],
  },
  {
    period: Periods['Late Babylonian'],
    periodModifier: PeriodModifiers.None,
    uncertain: false,
  },
  externalNumbers,
  [],
  new MesopotamianDate(
    { value: '1' },
    { value: '1' },
    { value: '1' },
    undefined,
    undefined,
    true
  ),
  [
    new MesopotamianDate(
      { value: '1' },
      { value: '1' },
      { value: '1' },
      undefined,
      undefined,
      true
    ),
  ]
)

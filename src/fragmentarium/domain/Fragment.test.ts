import _ from 'lodash'
import { Fragment, UncuratedReference } from './fragment'
import { RecordEntry } from './RecordEntry'
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
import { Museums } from './museum'
import { LooseDollarLine } from 'transliteration/domain/dollar-lines'
import { Genres } from 'fragmentarium/domain/Genres'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { PeriodModifiers, Periods } from 'common/period'

const config: Parameters<typeof Fragment['create']>[0] = {
  number: 'K.1',
  accession: '1',
  publication: 'A journal',
  joins: [
    [
      {
        museumNumber: 'K.2',
        isChecked: true,
        date: '',
        joinedBy: '',
        note: '',
        legacyData: '',
        isInFragmentarium: true,
        isEnvelope: true,
      },
    ],
  ],
  description: 'A clay tabled',
  measures: {
    length: 3,
    width: 5,
    thickness: 3.6,
  },
  collection: 'The collection',
  legacyScript: 'NA',
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
  notes: {
    text: 'Some notes',
    parts: [{ text: 'Some notes', type: 'StringPart' }],
  },
  museum: Museums['THE_BRITISH_MUSEUM'],
  references: [
    new Reference(
      'DISCUSSION',
      '34-54',
      '',
      [],
      new BibliographyEntry({ id: 'RN1853' })
    ),
  ],
  uncuratedReferences: [
    {
      document: 'CAD 7',
      pages: [3, 208],
    },
  ],
  traditionalReferences: [],
  atf: '$ (atf)',
  hasPhoto: true,
  genres: Genres.fromJson([
    { category: ['ARCHIVAL', 'Administrative'], uncertain: false },
    { category: ['CATALOGUE', 'Memos'], uncertain: true },
  ]),
  introduction: {
    text: 'The introduction',
    parts: [{ text: 'The introduction', type: 'StringPart' }],
  },
  script: {
    period: Periods['Neo-Assyrian'],
    periodModifier: PeriodModifiers.None,
    uncertain: false,
  },
  externalNumbers: {
    cdliNumber: 'A38',
    bmIdNumber: 'W_1848-0720-117',
    archibabNumber: '42',
    bdtnsNumber: '99',
    chicagoIsacNumber: 'd0be123f-2411-4dcd-b930-74d2eb9f19a4',
    urOnlineNumber: '123',
    hilprechtJenaNumber: '123',
    hilprechtHeidelbergNumber: '123',
    achemenetNumber: '123',
    nabuccoNumber: '123',
    metropolitanNumber: '123',
    louvreNumber: '123',
    alalahHpmNumber: '123',
    australianinstituteofarchaeologyNumber: '123',
    philadelphiaNumber: '123',
  },
  projects: [],
  authorizedScopes: ['CAIC'],
}

describe('Fragment', () => {
  const fragment = Fragment.create(config)

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
    const fragment = Fragment.create({ ...config, uncuratedReferences })
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
  const fragment = Fragment.create({ ...config, record: record })
  expect(fragment.uniqueRecord).toEqual(expected)
})

test.each([
  ['P201033', 'P201033'],
  ['', 'X000001'],
])('ATF headind, cdli number: %s', (cdliNumber, expected) => {
  const fragment = Fragment.create({
    ...config,
    externalNumbers: { ...config.externalNumbers, cdliNumber },
  })
  expect(fragment.atfHeading).toEqual(`&${expected} = ${config.number}
#project: eblo
#atf: lang akk-x-stdbab
#atf: use unicode
#atf: use math
#atf: use legacy`)
})

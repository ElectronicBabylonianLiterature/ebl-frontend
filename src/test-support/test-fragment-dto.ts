import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { MuseumKey } from 'fragmentarium/domain/museum'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { lines } from 'test-support/test-fragment-lines'

export const externalNumbers = {
  cdliNumber: 'A38',
  bmIdNumber: 'W_1848-0720-117',
  archibabNumber: '42',
  bdtnsNumber: '99',
  rstiNumber: '123',
  chicagoIsacNumber: 'd0be123f-2411-4dcd-b930-74d2eb9f19a4',
  urOnlineNumber: '123',
  hilprechtJenaNumber: '1235',
  hilprechtHeidelbergNumber: '11',
  achemenetNumber: '20',
  nabuccoNumber: '5',
  digitaleKeilschriftBibliothekNumber: '5',
  metropolitanNumber: '123',
  pierpontMorganNumber: '123',
  louvreNumber: '123',
  ontarioNumber: '123',
  kelseyNumber: '123',
  harvardHamNumber: '123',
  etcsriNumber: '123',
  sketchfabNumber: '123',
  arkNumber: '123',
  dublinTcdNumber: '123',
  cambridgeMaaNumber: '123',
  ashmoleanNumber: '123',
  alalahHpmNumber: '123',
  australianinstituteofarchaeologyNumber: '123',
  philadelphiaNumber: '123',
  spurlockNumber: '123',
}

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
  acquisition: {
    supplier: 'British Museum',
    date: 1925,
    description: 'Clay tablet',
  },
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
        isEnvelope: true,
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
        isEnvelope: true,
      },
    ],
  ],
  length: { value: 3.14, note: 'ca.' },
  width: { value: 0.30282212, note: '' },
  thickness: {},
  collection: '',
  legacyScript: 'NB',
  cdliImages: ['dl/lineart/P550449_l.jpg'],
  notes: {
    text: 'Note text',
    parts: [{ type: 'StringPart', text: 'Note text' }],
  },
  museum: 'THE_BRITISH_MUSEUM' as MuseumKey,
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
  atf: '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x',
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
  dossiers: [],
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

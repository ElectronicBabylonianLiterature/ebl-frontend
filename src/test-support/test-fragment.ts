import { Fragment } from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import Folio from 'fragmentarium/domain/Folio'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { Museums } from 'fragmentarium/domain/museum'
import { Genres } from 'fragmentarium/domain/Genres'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Acquisition } from 'fragmentarium/domain/Acquisition'
import { lines } from 'test-support/test-fragment-lines'
import { externalNumbers } from 'test-support/test-fragment-dto'

export { lines } from 'test-support/test-fragment-lines'
export { fragmentDto } from 'test-support/test-fragment-dto'

export const fragment = new Fragment({
  number: 'Test.Fragment',
  accession: 'A.38.b',
  publication: 'electronic Babylonian Library',
  acquisition: new Acquisition('British Museum', 1925, 'Clay tablet'),
  description: 'A fragment to be used when testing the eBL application',
  joins: [
    [
      {
        museumNumber: 'Test.Fragment',
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
        museumNumber: 'X.2.b',
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
  measures: {
    length: 3.14,
    width: 0.30282212,
    thickness: null,
    lengthNote: 'ca.',
    widthNote: null,
    thicknessNote: null,
  },
  collection: '',
  legacyScript: 'NB',
  cdliImages: ['dl/lineart/P550449_l.jpg'],
  folios: [new Folio({ name: 'FWG', number: 'M134' })],
  record: [
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
  text: new Text({ lines: lines.map((lineDto) => new TextLine(lineDto)) }),
  notes: {
    text: 'Note text',
    parts: [{ type: 'StringPart', text: 'Note text' }],
  },
  museum: Museums['THE_BRITISH_MUSEUM'],
  references: [
    new Reference(
      'DISCUSSION',
      '',
      '',
      [],
      new BibliographyEntry({ id: 'RN52' }),
    ),
  ],
  uncuratedReferences: null,
  traditionalReferences: ['text 1'],
  atf: '10. sal/: š[im {gu}[...].GA\n10. ::/sal ši]m\n10. šim | šim\n10. ...+ku {KA.G[A} ... ....ku x',
  hasPhoto: true,
  genres: Genres.fromJson([
    {
      category: ['ARCHIVE', 'Administrative', 'Lists'],
      uncertain: false,
    },
  ]),
  introduction: {
    text: 'Introduction',
    parts: [{ text: 'Introduction', type: 'StringPart' }],
  },
  script: {
    period: Periods['Late Babylonian'],
    periodModifier: PeriodModifiers.None,
    uncertain: false,
  },
  externalNumbers,
  projects: [],
  dossiers: [],
  date: new MesopotamianDate({
    year: { value: '1' },
    month: { value: '1' },
    day: { value: '1' },
    isSeleucidEra: true,
  }),
  datesInText: [
    new MesopotamianDate({
      year: { value: '1' },
      month: { value: '1' },
      day: { value: '1' },
      isSeleucidEra: true,
    }),
  ],
})

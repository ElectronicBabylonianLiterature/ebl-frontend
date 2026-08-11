import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import { MesopotamianDate } from 'chronology/domain/Date'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { silenceConsoleErrors } from 'setupTests'
import { bibliographyService } from 'fragmentarium/application/fragmentService.testSupport'

export {
  bibliographyService,
  createFragmentService,
  fragmentRepository,
  fragmentService,
  imageRepository,
  wordRepository,
} from 'fragmentarium/application/fragmentService.testSupport'

export const number = 'K.1'
export const genreOptions = [['ARCHIVE', 'Administrative']]
export const colophonNamesOptions = [['Humbaba', 'Enkidu']]
export const genres: Genres = Genres.fromJson([
  { category: ['ARCHIVE', 'Administrative'], uncertain: false },
])
export const date: MesopotamianDate = MesopotamianDate.fromJson({
  year: { value: '1' },
  month: { value: '1' },
  day: { value: '1' },
  king: { orderGlobal: 1 },
  isSeleucidEra: true,
})
export const datesInText: MesopotamianDate[] = [date]

export const provenanceOptions: readonly ProvenanceRecord[] = [
  {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bab',
    parent: 'Babylonia',
    sortKey: 20,
    coordinates: {
      latitude: 32.542,
      longitude: 44.42,
    },
    polygonCoordinates: [
      { latitude: 32.51, longitude: 44.4 },
      { latitude: 32.53, longitude: 44.44 },
      { latitude: 32.55, longitude: 44.41 },
    ],
  },
  {
    id: 'assur',
    longName: 'Aššur',
    abbreviation: 'Ašš',
    parent: 'Assyria',
    sortKey: 10,
    polygonCoordinates: [
      { latitude: 36.34, longitude: 43.1 },
      { latitude: 36.35, longitude: 43.12 },
    ],
  },
  {
    id: 'sippar',
    longName: 'Sippar',
    abbreviation: 'Sip',
    parent: 'Babylonia',
    sortKey: 30,
    coordinates: {
      latitude: Number.NaN,
      longitude: 44.25,
    },
    polygonCoordinates: [
      { latitude: 33.1, longitude: 44.2 },
      { latitude: Number.NaN, longitude: 44.3 },
      { latitude: 33.2, longitude: 44.4 },
      { latitude: 33.3, longitude: 44.35 },
    ],
  },
]
export const childrenOptions: readonly ProvenanceRecord[] = [
  {
    id: 'nippur',
    longName: 'Nippur',
    abbreviation: 'Nip',
    parent: 'Babylonia',
    sortKey: 2,
    coordinates: {
      latitude: 32.12,
      longitude: 45.12,
      uncertaintyRadiusKm: 4,
    },
  },
  {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bab',
    parent: 'Babylonia',
    sortKey: 1,
  },
]

export function buildTestFragment(): Fragment {
  const references = bibliographyEntryFactory
    .buildList(2)
    .map((entry: BibliographyEntry) =>
      referenceFactory.build({}, { associations: { document: entry } }),
    )
  return fragmentFactory.build(
    { number: number },
    { associations: { references: references, genres: new Genres([]) } },
  )
}

export function stubMissingBibliography(): void {
  bibliographyService.findMany.mockImplementation((ids: string[]) =>
    Promise.reject(new Error(`${ids} not found.`)),
  )
  silenceConsoleErrors()
}

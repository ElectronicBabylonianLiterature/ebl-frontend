// @flow
import { List, Record } from 'immutable'
import type { RecordOf, RecordFactory } from 'immutable'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
import type { DateRange } from 'moment-range'
// $FlowFixMe
import { immerable } from 'immer'
import Reference from '../bibliography/Reference'
import { Text } from './text'

const moment = extendMoment(Moment)

export type FragmentInfo = {|
  +number: string,
  +accession: string,
  +script: string,
  +description: string,
  +matchingLines: $ReadOnlyArray<$ReadOnlyArray<string>>,
  +editor: string,
  +edition_date: string
|}

type FolioType = {| +name: string, +hasImage: boolean |}
const folioTypes: $ReadOnly<{ [string]: FolioType }> = {
  WGL: { name: 'Lambert', hasImage: true },
  FWG: { name: 'Geers', hasImage: true },
  EL: { name: 'Leichty', hasImage: true },
  AKG: { name: 'Grayson', hasImage: true },
  MJG: { name: 'Geller', hasImage: true },
  WRM: { name: 'Mayer', hasImage: true },
  CB: { name: 'Bezold', hasImage: true },
  JS: { name: 'Strassmaier', hasImage: false }
}

export class Folio {
  +name: string
  +number: string
  #type: FolioType

  constructor({ name, number }: { name: string, number: string }) {
    this.name = name
    this.number = number
    this.#type = folioTypes[name] || { name, hasImage: false }
  }

  get humanizedName() {
    return this.#type.name
  }

  get hasImage() {
    return this.#type.hasImage
  }

  get fileName() {
    return `${this.name}_${this.number}.jpg`
  }
}
Folio[immerable] = true

const historicalTransliteration = 'HistoricalTransliteration'

type RecordType =
  | 'HistoricalTransliteration'
  | 'Revision'
  | 'Transliteration'
  | 'Collation'

export class RecordEntry {
  +user: string
  +date: string
  +type: RecordType

  constructor({
    user,
    date,
    type
  }: {
    user: string,
    date: string,
    type: RecordType
  }) {
    this.user = user
    this.date = date
    this.type = type
  }

  get moment(): DateRange | Moment {
    return this.isHistorical ? moment.range(this.date) : moment(this.date)
  }

  get isHistorical(): boolean {
    return this.type === historicalTransliteration
  }

  dateEquals(other: RecordEntry): boolean {
    const onSameDate = (first, second) => {
      const sameYear = first.year() === second.year()
      const sameDayOfYear = first.dayOfYear() === second.dayOfYear()
      return sameYear && sameDayOfYear
    }
    const differentUser = this.user !== other.user
    const differentType = this.type !== other.type

    return differentUser || differentType || this.isHistorical
      ? false
      : onSameDate(this.moment, other.moment)
  }
}
RecordEntry[immerable] = true

export type Measures = {|
  +length: ?number,
  +width: ?number,
  +thickness: ?number
|}

export type UncuratedReference = {|
  +document: string,
  +pages: $ReadOnlyArray<number>
|}

type FragmentProps = {
  number: string,
  cdliNumber: string,
  bmIdNumber: string,
  accession: string,
  publication: string,
  joins: List<string>,
  description: string,
  measures: Measures,
  collection: '',
  script: '',
  folios: List<Folio>,
  record: List<RecordEntry>,
  text: Text,
  notes: string,
  museum: string,
  references: List<any>,
  uncuratedReferences: ?List<UncuratedReference>,
  atf: string,
  matchingLines: List<any>
}
const fragmentDefaults: FragmentProps = {
  number: '',
  cdliNumber: '',
  bmIdNumber: '',
  accession: '',
  publication: '',
  joins: List(),
  description: '',
  measures: { length: null, width: null, thickness: null },
  collection: '',
  script: '',
  folios: List(),
  record: List(),
  text: new Text({ lines: [] }),
  notes: '',
  museum: '',
  references: List(),
  uncuratedReferences: null,
  atf: '',
  matchingLines: List()
}
const FragmentRecord = Record(fragmentDefaults)
export class Fragment extends FragmentRecord {
  get hasUncuratedReferences() {
    return List.isList(this.get('uncuratedReferences'))
  }

  get uniqueRecord() {
    const reducer = (filteredRecord, recordEntry, index) => {
      const keepRecord =
        filteredRecord.isEmpty() ||
        !filteredRecord.last().dateEquals(recordEntry)
      return keepRecord ? filteredRecord.push(recordEntry) : filteredRecord
    }
    return this.get('record').reduce(reducer, List())
  }

  setReferences(references: List<Reference>) {
    return this.set('references', references)
  }
}

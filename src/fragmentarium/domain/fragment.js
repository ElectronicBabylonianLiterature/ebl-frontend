// @flow
import _ from 'lodash'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
import type { DateRange } from 'moment-range'
import { produce, immerable } from 'immer'
import type { Draft } from 'immer'
import Reference from 'bibliography/domain/Reference'
import { Text } from './text'
import Museum from './museum'

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
  JS: { name: 'Strassmaier', hasImage: true }
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

export class Fragment {
  +number: string
  +cdliNumber: string
  +bmIdNumber: string
  +accession: string
  +publication: string
  +joins: $ReadOnlyArray<string>
  +description: string
  +measures: Measures
  +collection: string
  +script: string
  +folios: $ReadOnlyArray<Folio>
  +record: $ReadOnlyArray<RecordEntry>
  +text: Text
  +notes: string
  +museum: Museum
  +references: $ReadOnlyArray<any>
  +uncuratedReferences: ?$ReadOnlyArray<UncuratedReference>
  +atf: string
  +hasPhoto: boolean

  constructor({
    number,
    cdliNumber,
    bmIdNumber,
    accession,
    publication,
    joins,
    description,
    measures,
    collection,
    script,
    folios,
    record,
    text,
    notes,
    museum,
    references,
    uncuratedReferences,
    atf,
    hasPhoto
  }: {
    number: string,
    cdliNumber: string,
    bmIdNumber: string,
    accession: string,
    publication: string,
    joins: $ReadOnlyArray<string>,
    description: string,
    measures: Measures,
    collection: string,
    script: string,
    folios: $ReadOnlyArray<Folio>,
    record: $ReadOnlyArray<RecordEntry>,
    text: Text,
    notes: string,
    museum: Museum,
    references: $ReadOnlyArray<any>,
    uncuratedReferences?: ?$ReadOnlyArray<UncuratedReference>,
    atf: string,
    hasPhoto: boolean
  }) {
    this.number = number
    this.cdliNumber = cdliNumber
    this.bmIdNumber = bmIdNumber
    this.accession = accession
    this.publication = publication
    this.joins = joins
    this.description = description
    this.measures = measures
    this.collection = collection
    this.script = script
    this.folios = folios
    this.record = record
    this.text = text
    this.notes = notes
    this.museum = museum
    this.references = references
    this.uncuratedReferences = uncuratedReferences
    this.atf = atf
    this.hasPhoto = hasPhoto
  }

  get hasUncuratedReferences(): boolean {
    return !_.isNil(this.uncuratedReferences)
  }

  get uniqueRecord(): $ReadOnlyArray<RecordEntry> {
    const reducer = (filteredRecord, recordEntry) => {
      const keepRecord =
        _.isEmpty(filteredRecord) ||
        !_.last(filteredRecord).dateEquals(recordEntry)
      if (keepRecord) {
        filteredRecord.push(recordEntry)
      }
      return filteredRecord
    }
    return this.record.reduce(reducer, [])
  }

  setReferences(references: $ReadOnlyArray<Reference>): Fragment {
    return produce(this, (draft: Draft<Fragment>) => {
      draft.references = references
    })
  }

  get hasLink() {
    return this.museum.hasFragmentLink(this)
  }

  getLink() {
    return this.museum.createLinkFor(this)
  }
}
Fragment[immerable] = true

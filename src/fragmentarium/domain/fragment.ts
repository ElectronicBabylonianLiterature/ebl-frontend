import _ from 'lodash'
import * as Moment from 'moment'
import { extendMoment, DateRange } from 'moment-range'
import produce, { Draft, immerable } from 'immer'

import Reference from 'bibliography/domain/Reference'
import { Text } from './text'
import Museum from './museum'

const moment = extendMoment(Moment)

export interface FragmentInfo {
  readonly number: string
  readonly accession: string
  readonly script: string
  readonly description: string
  readonly matchingLines: ReadonlyArray<ReadonlyArray<string>>
  readonly editor: string
  readonly edition_date: string
}

interface FolioType {
  readonly name: string
  readonly hasImage: boolean
}

const folioTypes: { readonly [key: string]: FolioType } = {
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
  readonly name: string
  readonly number: string
  private readonly type: FolioType

  constructor({ name, number }: { name: string; number: string }) {
    this.name = name
    this.number = number
    this.type = folioTypes[name] || { name, hasImage: false }
  }

  get humanizedName() {
    return this.type.name
  }

  get hasImage() {
    return this.type.hasImage
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
  readonly user: string
  readonly date: string
  readonly type: RecordType

  constructor({
    user,
    date,
    type
  }: {
    user: string
    date: string
    type: RecordType
  }) {
    this.user = user
    this.date = date
    this.type = type
  }

  get moment(): DateRange | Moment.Moment {
    return this.isHistorical
      ? moment.range(this.date)
      : Moment.default(this.date)
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

export interface Measures {
  readonly length: number | null
  readonly width: number | null
  readonly thickness: number | null
}

export interface UncuratedReference {
  readonly document: string
  readonly pages: ReadonlyArray<number>
}

export class Fragment {
  readonly number: string
  readonly cdliNumber: string
  readonly bmIdNumber: string
  readonly accession: string
  readonly publication: string
  readonly joins: ReadonlyArray<string>
  readonly description: string
  readonly measures: Measures
  readonly collection: string
  readonly script: string
  readonly folios: ReadonlyArray<Folio>
  readonly record: ReadonlyArray<RecordEntry>
  readonly text: Text
  readonly notes: string
  readonly museum: Museum
  readonly references: ReadonlyArray<any>
  readonly uncuratedReferences: ReadonlyArray<UncuratedReference> | null
  readonly atf: string
  readonly hasPhoto: boolean

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
    number: string
    cdliNumber: string
    bmIdNumber: string
    accession: string
    publication: string
    joins: ReadonlyArray<string>
    description: string
    measures: Measures
    collection: string
    script: string
    folios: ReadonlyArray<Folio>
    record: ReadonlyArray<RecordEntry>
    text: Text
    notes: string
    museum: Museum
    references: ReadonlyArray<any>
    uncuratedReferences?: ReadonlyArray<UncuratedReference> | null
    atf: string
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
    this.uncuratedReferences = uncuratedReferences || null
    this.atf = atf
    this.hasPhoto = hasPhoto
  }

  get hasUncuratedReferences(): boolean {
    return !_.isNil(this.uncuratedReferences)
  }

  get uniqueRecord(): ReadonlyArray<RecordEntry> {
    const reducer = (
      filteredRecord: RecordEntry[],
      recordEntry: RecordEntry
    ) => {
      const last = _.last(filteredRecord)
      const keepRecord = !last || !last.dateEquals(recordEntry)
      if (keepRecord) {
        filteredRecord.push(recordEntry)
      }
      return filteredRecord
    }
    return this.record.reduce(reducer, [])
  }

  setReferences(references: Reference[]): Fragment {
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

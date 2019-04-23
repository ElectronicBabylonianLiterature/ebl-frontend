import { List, Record, Map } from 'immutable'
import moment from 'moment'

const FolioType = Record({ name: '', hasImage: false })
const folioTypes = Map({
  WGL: FolioType({ name: 'Lambert', hasImage: true }),
  FWG: FolioType({ name: 'Geers', hasImage: false }),
  EL: FolioType({ name: 'Leichty', hasImage: true }),
  AKG: FolioType({ name: 'Grayson', hasImage: true }),
  MJG: FolioType({ name: 'Geller', hasImage: true }),
  WRM: FolioType({ name: 'Mayer', hasImage: true })
})

function getYear (date) {
  return moment(date).year()
}

function getDay (date) {
  return moment(date).dayOfYear()
}

function compareRecordEntries (prevRecordEntry, recordEntry) {
  return recordEntry.user === prevRecordEntry.user && recordEntry.type === prevRecordEntry.type &&
  getYear(recordEntry.date) === getYear(prevRecordEntry.date) &&
  getDay(recordEntry.date) === getDay(prevRecordEntry.date)
}

function filterRecord (record) {
  return record.reduce((filteredRecord, recordEntry, index) => {
    return filteredRecord.isEmpty() || !compareRecordEntries(filteredRecord.last(), recordEntry)
      ? filteredRecord.push(recordEntry)
      : filteredRecord
  },
  List())
}

export class Folio {
  #type

  constructor ({ name, number }) {
    this.name = name
    this.number = number
    this.#type = folioTypes.get(name, FolioType({ name }))
    Object.freeze(this)
  }

  get humanizedName () {
    return this.#type.name
  }

  get hasImage () {
    return this.#type.hasImage
  }

  get fileName () {
    return `${this.name}_${this.number}.jpg`
  }
}

export class RecordEntry extends Record({
  user: '',
  date: '',
  type: ''
}) {
  get moment () {
    return moment(this.date)
  }

  dateEquals (other) {
    const sameUser = this.user === other.user
    const sameType = this.type === other.type

    if (!sameUser || !sameType || this.type === 'HistoricalTransliteration') {
      return false
    } else {
      const sameYear = this.moment.year() === other.moment.year()
      const sameDayOfYear = this.moment.dayOfYear() === other.moment.dayOfYear()
      return sameYear && sameDayOfYear
    }
  }
}

export const Measures = Record({ length: null, width: null, thickness: null })

export const Line = Record({ type: '', prefix: '', content: List() })

export const Text = Record({ lines: List() })

export const UncuratedReference = Record({ document: '', pages: List() })

export class Fragment extends Record({
  number: '',
  cdliNumber: '',
  bmIdNumber: '',
  accession: '',
  publication: '',
  joins: List(),
  description: '',
  measures: Measures(),
  collection: '',
  script: '',
  folios: List(),
  record: List(),
  text: Text(),
  notes: '',
  museum: '',
  references: List(),
  uncuratedReferences: null,
  atf: '',
  matchingLines: List()
}) {
  get hasUncuratedReferences () {
    return List.isList(this.uncuratedReferences)
  }

  get uniqueRecord () {
    return filterRecord(this.record)
  }

  setReferences (references) {
    return this.set('references', references)
  }
}

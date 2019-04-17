import { List, Record, Map } from 'immutable'
import Moment from 'moment'

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
  return Moment(date).year()
}

function getDay (date) {
  return Moment(date).dayOfYear()
}

function filterRecords (record) {
  return record.reduce((newList, recordEntry, index) => {
    let prevRecordEntry = record.get(index - 1)
    return index === 0
      ? newList.push(recordEntry)
      : recordEntry.user === prevRecordEntry.user && recordEntry.type === prevRecordEntry.type &&
      getYear(recordEntry.date) === getYear(prevRecordEntry.date) &&
      getDay(recordEntry.date) === getDay(prevRecordEntry.date)
        ? newList
        : newList.push(recordEntry)
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

export const RecordEntry = Record({ user: '', date: '', type: '' })

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
    return filterRecords(this.record)
  }

  setReferences (references) {
    return this.set('references', references)
  }
}

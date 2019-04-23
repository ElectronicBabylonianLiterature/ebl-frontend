import { List, Record, Map } from 'immutable'
import Moment from 'moment'
import { extendMoment } from 'moment-range'

const moment = extendMoment(Moment)

const FolioType = Record({ name: '', hasImage: false })
const folioTypes = Map({
  WGL: FolioType({ name: 'Lambert', hasImage: true }),
  FWG: FolioType({ name: 'Geers', hasImage: false }),
  EL: FolioType({ name: 'Leichty', hasImage: true }),
  AKG: FolioType({ name: 'Grayson', hasImage: true }),
  MJG: FolioType({ name: 'Geller', hasImage: true }),
  WRM: FolioType({ name: 'Mayer', hasImage: true })
})

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

const historicalTransliteration = 'HistoricalTransliteration'

export class RecordEntry extends Record({
  user: '',
  date: '',
  type: ''
}) {
  get moment () {
    return this.isHistorical
      ? moment.range(this.date)
      : moment(this.date)
  }

  get isHistorical () {
    return this.type === historicalTransliteration
  }

  dateEquals (other) {
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
    const reducer = (filteredRecord, recordEntry, index) => {
      const keepRecord = filteredRecord.isEmpty() || !filteredRecord.last().dateEquals(recordEntry)
      return keepRecord
        ? filteredRecord.push(recordEntry)
        : filteredRecord
    }
    return this.record.reduce(reducer, List())
  }

  setReferences (references) {
    return this.set('references', references)
  }
}

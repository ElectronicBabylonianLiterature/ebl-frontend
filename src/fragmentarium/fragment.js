// @flow
import { List, Record } from 'immutable'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
import Lemma from './lemmatization/Lemma'
import Lemmatization, {
  LemmatizationToken
} from './lemmatization/Lemmatization'
import Reference from '../bibliography/Reference'

const moment = extendMoment(Moment)

type FolioType = {| +name: string, +hasImage: boolean |}
const folioTypes: $ReadOnly<{ [string]: FolioType }> = {
  WGL: { name: 'Lambert', hasImage: true },
  FWG: { name: 'Geers', hasImage: false },
  EL: { name: 'Leichty', hasImage: true },
  AKG: { name: 'Grayson', hasImage: true },
  MJG: { name: 'Geller', hasImage: true },
  WRM: { name: 'Mayer', hasImage: true },
  CB: { name: 'Bezold', hasImage: false },
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

const historicalTransliteration = 'HistoricalTransliteration'

export class RecordEntry extends Record({
  user: '',
  date: '',
  type: ''
}) {
  get moment() {
    return this.isHistorical
      ? moment.range(this.get('date'))
      : moment(this.get('date'))
  }

  get isHistorical() {
    return this.get('type') === historicalTransliteration
  }

  dateEquals(other: RecordEntry) {
    const onSameDate = (first, second) => {
      const sameYear = first.year() === second.year()
      const sameDayOfYear = first.dayOfYear() === second.dayOfYear()
      return sameYear && sameDayOfYear
    }
    const differentUser = this.get('user') !== other.get('user')
    const differentType = this.get('type') !== other.get('type')

    return differentUser || differentType || this.isHistorical
      ? false
      : onSameDate(this.moment, other.moment)
  }
}

export const Measures = Record({ length: null, width: null, thickness: null })

export const Line = Record({ type: '', prefix: '', content: List() })

type UniqueLemma = $ReadOnlyArray<Lemma>
export class Text extends Record({
  lines: List()
}) {
  createLemmatization(
    lemmas: { [string]: $ReadOnlyArray<Lemma> },
    suggestions: { [string]: $ReadOnlyArray<UniqueLemma> }
  ) {
    return new Lemmatization(
      this.get('lines')
        .map(line => line.prefix)
        .toJS(),
      this.get('lines')
        .toSeq()
        .map(line => line.content)
        .map(tokens =>
          tokens.map(token =>
            token.get('lemmatizable', false)
              ? new LemmatizationToken(
                  token.get('value'),
                  true,
                  token
                    .get('uniqueLemma', [])
                    .map(id => lemmas[id])
                    .toJS(),
                  suggestions[token.get('value')]
                )
              : new LemmatizationToken(token.get('value'), false)
          )
        )
        .toJS()
    )
  }
}

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
  text: new Text(),
  notes: '',
  museum: '',
  references: List(),
  uncuratedReferences: null,
  atf: '',
  matchingLines: List()
}) {
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

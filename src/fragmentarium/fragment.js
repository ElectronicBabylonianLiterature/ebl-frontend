// @flow
import { List, Record } from 'immutable'
import type { RecordOf, RecordFactory } from 'immutable'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
import type { DateRange } from 'moment-range'
// $FlowFixMe
import { immerable } from 'immer'
import Lemma from './lemmatization/Lemma'
import Lemmatization, {
  LemmatizationToken
} from './lemmatization/Lemmatization'
import Reference from '../bibliography/Reference'

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

export type Measures = {
  +length: ?number,
  +width: ?number,
  +thickness: ?number
}

type Word = {|
  +type: 'Word',
  +value: string,
  +uniqueLemma: $ReadOnlyArray<string>,
  +normalized: boolean,
  +language: string,
  +lemmatizable: boolean,
  +erasure: string,
  +alignment?: number
|}

type LoneDeterminative = {|
  +type: 'LoneDeterminative',
  +value: string,
  +uniqueLemma: $ReadOnlyArray<string>,
  +normalized: boolean,
  +language: string,
  +lemmatizable: boolean,
  +partial: [boolean, boolean],
  +erasure: string,
  +alignment?: number
|}

type Shift = {|
  +type: 'LanguageShift',
  +value: string,
  +normalized: boolean,
  +language: string
|}

type Erasure = {|
  +type: 'Erasure',
  +value: string,
  +side: string
|}

export type Token =
  | {|
      +type: string,
      +value: string
    |}
  | Word
  | LoneDeterminative
  | Shift
  | Erasure

export type Line = {|
  +type: 'ControlLine' | 'EmptyLine' | 'TextLine',
  +prefix: string,
  +content: $ReadOnlyArray<Token>
|}

type UniqueLemma = $ReadOnlyArray<Lemma>

export class Text {
  +lines: $ReadOnlyArray<Line>

  constructor({ lines }: { lines: $ReadOnlyArray<Line> }) {
    this.lines = lines
  }

  createLemmatization(
    lemmas: { [string]: UniqueLemma },
    suggestions: { [string]: $ReadOnlyArray<UniqueLemma> }
  ) {
    return new Lemmatization(
      this.lines.map(line => line.prefix),
      this.lines
        .map(line => line.content)
        .map(tokens =>
          tokens.map(token =>
            token.lemmatizable
              ? new LemmatizationToken(
                  token.value,
                  true,
                  (token.uniqueLemma || []).map(id => lemmas[id]),
                  suggestions[token.value]
                )
              : new LemmatizationToken(token.value, false)
          )
        )
    )
  }
}
Text[immerable] = true

type UncuratedReferenceProps = { document: string, pages: List<number> }
export const UncuratedReference: RecordFactory<UncuratedReferenceProps> = Record(
  { document: '', pages: List() }
)

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
  uncuratedReferences: ?List<RecordOf<UncuratedReference>>,
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

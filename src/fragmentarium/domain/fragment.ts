import _ from 'lodash'
import * as Moment from 'moment'
import { extendMoment, DateRange } from 'moment-range'
import produce, { castDraft, Draft, immerable } from 'immer'

import Reference from 'bibliography/domain/Reference'
import { Text } from 'transliteration/domain/text'
import Museum, { FragmentLink } from './museum'
import Folio from './Folio'
import { Genres } from 'fragmentarium/domain/Genres'

const moment = extendMoment(Moment)

export interface FragmentInfo {
  readonly number: string
  readonly accession: string
  readonly script: string
  readonly description: string
  readonly matchingLines: ReadonlyArray<ReadonlyArray<string>>
  readonly editor: string
  // eslint-disable-next-line camelcase
  readonly edition_date: string
  readonly references: ReadonlyArray<Reference>
}

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
    type,
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
    const onSameDate = (
      first: Moment.Moment,
      second: Moment.Moment
    ): boolean => {
      const sameYear = first.year() === second.year()
      const sameDayOfYear = first.dayOfYear() === second.dayOfYear()
      return sameYear && sameDayOfYear
    }
    const differentUser = this.user !== other.user
    const differentType = this.type !== other.type

    return differentUser || differentType || this.isHistorical
      ? false
      : onSameDate(this.moment as Moment.Moment, other.moment as Moment.Moment)
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

export interface Join {
  readonly museumNumber: string
  readonly isChecked: boolean
  readonly joinedBy: string
  readonly date: string
  readonly note: string
  readonly legacyData: string
}

export class Fragment {
  readonly [immerable] = true

  constructor(
    readonly number: string,
    readonly cdliNumber: string,
    readonly bmIdNumber: string,
    readonly accession: string,
    readonly publication: string,
    readonly joins: ReadonlyArray<ReadonlyArray<Join>>,
    readonly description: string,
    readonly measures: Measures,
    readonly collection: string,
    readonly script: string,
    readonly folios: ReadonlyArray<Folio>,
    readonly record: ReadonlyArray<RecordEntry>,
    readonly text: Text,
    readonly notes: string,
    readonly museum: Museum,
    readonly references: ReadonlyArray<Reference>,
    readonly uncuratedReferences: ReadonlyArray<UncuratedReference> | null,
    readonly atf: string,
    readonly hasPhoto: boolean,
    readonly genres: Genres
  ) {}

  static create({
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
    hasPhoto,
    genres,
  }: {
    number: string
    cdliNumber: string
    bmIdNumber: string
    accession: string
    publication: string
    joins: ReadonlyArray<ReadonlyArray<Join>>
    description: string
    measures: Measures
    collection: string
    script: string
    folios: ReadonlyArray<Folio>
    record: ReadonlyArray<RecordEntry>
    text: Text
    notes: string
    museum: Museum
    references: ReadonlyArray<Reference>
    uncuratedReferences?: ReadonlyArray<UncuratedReference> | null
    atf: string
    hasPhoto: boolean
    genres: Genres
  }): Fragment {
    return new Fragment(
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
      uncuratedReferences ?? null,
      atf,
      hasPhoto,
      genres
    )
  }

  get hasUncuratedReferences(): boolean {
    return !_.isNil(this.uncuratedReferences)
  }

  get uniqueRecord(): ReadonlyArray<RecordEntry> {
    const reducer = (
      filteredRecord: RecordEntry[],
      recordEntry: RecordEntry
    ): RecordEntry[] => {
      const last = _.last(filteredRecord)
      const keepRecord = !last || !last.dateEquals(recordEntry)
      if (keepRecord) {
        filteredRecord.push(recordEntry)
      }
      return filteredRecord
    }
    return this.record.reduce(reducer, [])
  }

  setReferences(references: ReadonlyArray<Reference>): Fragment {
    return produce(this, (draft: Draft<Fragment>) => {
      draft.references = castDraft(references)
    })
  }

  get hasLink(): boolean {
    return this.museum.hasFragmentLink(this)
  }

  getLink(): FragmentLink {
    return this.museum.createLinkFor(this)
  }

  get atfHeading(): string {
    const cdliNumber = this.cdliNumber || 'X000001'
    return `&${cdliNumber} = ${this.number}
#project: eblo
#atf: lang akk-x-stdbab
#atf: use unicode
#atf: use math
#atf: use legacy`
  }
}

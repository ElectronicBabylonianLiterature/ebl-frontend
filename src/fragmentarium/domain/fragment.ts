import _ from 'lodash'
import { DateTime, Interval } from 'luxon'
import produce, { castDraft, Draft, immerable } from 'immer'

import Reference from 'bibliography/domain/Reference'
import { Text } from 'transliteration/domain/text'
import Museum, { FragmentLink } from './museum'
import Folio from './Folio'
import { Genres } from 'fragmentarium/domain/Genres'
import { Joins } from './join'

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
  readonly genres: Genres
}

const historicalTransliteration = 'HistoricalTransliteration'

type RecordType =
  | typeof historicalTransliteration
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

  get moment(): DateTime | Interval {
    return this.isHistorical
      ? Interval.fromISO(this.date)
      : DateTime.fromISO(this.date)
  }

  get isHistorical(): boolean {
    return this.type === historicalTransliteration
  }

  dateEquals(other: RecordEntry): boolean {
    const differentUser = this.user !== other.user
    const differentType = this.type !== other.type

    return differentUser || differentType || this.isHistorical
      ? false
      : (this.moment as DateTime).hasSame(other.moment as DateTime, 'day')
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
  readonly [immerable] = true

  constructor(
    readonly number: string,
    readonly cdliNumber: string,
    readonly bmIdNumber: string,
    readonly accession: string,
    readonly publication: string,
    readonly joins: Joins,
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
    readonly genres: Genres,
    readonly editedInOraccProject: string
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
    editedInOraccProject,
  }: {
    number: string
    cdliNumber: string
    bmIdNumber: string
    accession: string
    publication: string
    joins: Joins
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
    editedInOraccProject: string
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
      genres,
      editedInOraccProject
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

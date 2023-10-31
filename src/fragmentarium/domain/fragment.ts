import _ from 'lodash'
import produce, { castDraft, Draft, immerable } from 'immer'

import Reference from 'bibliography/domain/Reference'
import { Text } from 'transliteration/domain/text'
import Museum, { FragmentLink } from './museum'
import Folio from './Folio'
import { Genres } from 'fragmentarium/domain/Genres'
import { Joins } from './join'
import { MarkupPart } from 'transliteration/domain/markup'
import { Period, PeriodModifier } from 'common/period'
import { Session } from 'auth/Session'
import {
  ExternalNumber,
  ExternalNumbers,
  ExternalNumberTypes,
} from './FragmentDtos'
import { RecordEntry } from './RecordEntry'
import { ResearchProject } from 'research-projects/researchProject'
import { MesopotamianDate } from 'fragmentarium/domain/Date'
import { Archaeology } from './archaeology'

export interface FragmentInfo {
  readonly number: string
  readonly accession: string
  readonly script: Script
  readonly description: string
  readonly matchingLines: Text | null
  readonly editor: string
  // eslint-disable-next-line camelcase
  readonly edition_date: string
  readonly references: ReadonlyArray<Reference>
  readonly genres: Genres
}

export interface FragmentInfosPagination {
  fragmentInfos: readonly FragmentInfo[]
  totalCount: number
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

export interface Introduction {
  readonly text: string
  readonly parts: ReadonlyArray<MarkupPart>
}

export interface Notes {
  readonly text: string
  readonly parts: ReadonlyArray<MarkupPart>
}

export interface Script {
  readonly period: Period
  readonly periodModifier: PeriodModifier
  readonly uncertain: boolean
}

export interface ScriptDto {
  readonly period: string
  readonly periodModifier: string
  readonly uncertain: boolean
}

export class Fragment {
  readonly [immerable] = true

  constructor(
    readonly number: string,
    readonly accession: string,
    readonly publication: string,
    readonly joins: Joins,
    readonly description: string,
    readonly measures: Measures,
    readonly collection: string,
    readonly legacyScript: string,
    readonly folios: ReadonlyArray<Folio>,
    readonly record: ReadonlyArray<RecordEntry>,
    readonly text: Text,
    readonly notes: Notes,
    readonly museum: Museum,
    readonly references: ReadonlyArray<Reference>,
    readonly uncuratedReferences: ReadonlyArray<UncuratedReference> | null,
    readonly atf: string,
    readonly hasPhoto: boolean,
    readonly genres: Genres,
    readonly editedInOraccProject: string,
    readonly introduction: Introduction,
    readonly script: Script,
    readonly externalNumbers: ExternalNumbers,
    readonly projects: ReadonlyArray<ResearchProject>,
    readonly date?: MesopotamianDate,
    readonly datesInText?: ReadonlyArray<MesopotamianDate>,
    readonly archaeology?: Archaeology
  ) {}

  static create({
    number,
    accession,
    publication,
    joins,
    description,
    measures,
    collection,
    legacyScript,
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
    introduction,
    script,
    externalNumbers,
    projects,
    date,
    datesInText,
    archaeology,
  }: {
    number: string
    accession: string
    publication: string
    joins: Joins
    description: string
    measures: Measures
    collection: string
    legacyScript: string
    folios: ReadonlyArray<Folio>
    record: ReadonlyArray<RecordEntry>
    text: Text
    notes: Notes
    museum: Museum
    references: ReadonlyArray<Reference>
    uncuratedReferences?: ReadonlyArray<UncuratedReference> | null
    atf: string
    hasPhoto: boolean
    genres: Genres
    editedInOraccProject: string
    introduction: Introduction
    script: Script
    externalNumbers: ExternalNumbers
    projects: ReadonlyArray<ResearchProject>
    date?: MesopotamianDate
    datesInText?: ReadonlyArray<MesopotamianDate>
    archaeology?: Archaeology
  }): Fragment {
    return new Fragment(
      number,
      accession,
      publication,
      joins,
      description,
      measures,
      collection,
      legacyScript,
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
      editedInOraccProject,
      introduction,
      script,
      externalNumbers,
      projects,
      date,
      datesInText,
      archaeology
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

  filterFolios(session: Session): Fragment {
    return produce(this, (draft: Draft<Fragment>) => {
      draft.folios = this.folios.filter((folio) =>
        session.isAllowedToReadFolio(folio)
      )
    })
  }

  private getExternalNumber(
    numberType: Exclude<ExternalNumber, 'oraccNumbers'>
  ): string {
    return this.externalNumbers[numberType] || ''
  }

  get cdliNumber(): string {
    return this.getExternalNumber('cdliNumber')
  }
  get bmIdNumber(): string {
    return this.getExternalNumber('bmIdNumber')
  }
  get archibabNumber(): string {
    return this.getExternalNumber('archibabNumber')
  }
  get bdtnsNumber(): string {
    return this.getExternalNumber('bdtnsNumber')
  }
  get urOnlineNumber(): string {
    return this.getExternalNumber('urOnlineNumber')
  }
  get hilprechtJenaNumber(): string {
    return this.getExternalNumber('hilprechtJenaNumber')
  }
  get hilprechtHeidelbergNumber(): string {
    return this.getExternalNumber('hilprechtHeidelbergNumber')
  }
  get metropolitanNumber(): string {
    return this.getExternalNumber('metropolitanNumber')
  }
  get yalePeabodyNumber(): string {
    return this.getExternalNumber('yalePeabodyNumber')
  }
  get oraccNumbers(): readonly string[] {
    return this.externalNumbers['oraccNumbers'] || []
  }
  get hasExternalResources(): boolean {
    return _.some([
      ...this.oraccNumbers,
      ...ExternalNumberTypes.map((number) => this.getExternalNumber(number)),
    ])
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

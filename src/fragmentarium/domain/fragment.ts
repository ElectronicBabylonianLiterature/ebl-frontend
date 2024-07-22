import _ from 'lodash'
import produce, { castDraft, Draft, immerable } from 'immer'

import Reference from 'bibliography/domain/Reference'
import { Text } from 'transliteration/domain/text'
import { Museum } from './museum'
import Folio from './Folio'
import { Genres } from 'fragmentarium/domain/Genres'
import { Joins } from './join'
import { MarkupPart } from 'transliteration/domain/markup'
import { Period, PeriodModifier } from 'common/period'
import { Session } from 'auth/Session'
import FragmentDto, {
  ExternalNumber,
  ExternalNumbers,
  ExternalNumberTypes,
} from './FragmentDtos'
import { RecordEntry } from './RecordEntry'
import { ResearchProject } from 'research-projects/researchProject'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Archaeology } from './archaeology'
import { Colophon } from 'fragmentarium/domain/Colophon'

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

export type FragmentInfoDto = Omit<FragmentInfo, 'script' | 'accession'> &
  Pick<FragmentDto, 'script' | 'accession'>

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

interface FragmentProps {
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
  traditionalReferences: readonly string[]
  atf: string
  hasPhoto: boolean
  genres: Genres
  introduction: Introduction
  script: Script
  externalNumbers: ExternalNumbers
  projects: ReadonlyArray<ResearchProject>
  date?: MesopotamianDate
  datesInText?: ReadonlyArray<MesopotamianDate>
  archaeology?: Archaeology
  colophon?: Colophon
  authorizedScopes?: string[]
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
    readonly traditionalReferences: readonly string[],
    readonly atf: string,
    readonly hasPhoto: boolean,
    readonly genres: Genres,
    readonly introduction: Introduction,
    readonly script: Script,
    readonly externalNumbers: ExternalNumbers,
    readonly projects: ReadonlyArray<ResearchProject>,
    readonly date?: MesopotamianDate,
    readonly datesInText?: ReadonlyArray<MesopotamianDate>,
    readonly archaeology?: Archaeology,
    readonly colophon?: Colophon,
    readonly authorizedScopes?: string[]
  ) {}

  static create(props: FragmentProps): Fragment {
    return new Fragment(
      props.number,
      props.accession,
      props.publication,
      props.joins,
      props.description,
      props.measures,
      props.collection,
      props.legacyScript,
      props.folios,
      props.record,
      props.text,
      props.notes,
      props.museum,
      props.references,
      props?.uncuratedReferences ?? null,
      props.traditionalReferences,
      props.atf,
      props.hasPhoto,
      props.genres,
      props.introduction,
      props.script,
      props.externalNumbers,
      props.projects,
      props.date,
      props.datesInText,
      props.archaeology,
      props.colophon,
      props.authorizedScopes
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

  filterFolios(session: Session): Fragment {
    return produce(this, (draft: Draft<Fragment>) => {
      draft.folios = this.folios.filter((folio) =>
        session.isAllowedToReadFolio(folio)
      )
    })
  }

  public getExternalNumber(numberType: ExternalNumber): string {
    return this.externalNumbers[numberType] || ''
  }
  get oraccNumbers(): readonly string[] {
    return this.externalNumbers['oraccNumbers'] || []
  }
  get sealNumbers(): readonly string[] {
    return this.externalNumbers['sealNumbers'] || []
  }
  get hasExternalResources(): boolean {
    return _.some([
      ...this.oraccNumbers,
      ...this.sealNumbers,
      ...ExternalNumberTypes.map((number) =>
        this.getExternalNumber(number as ExternalNumber)
      ),
    ])
  }

  get atfHeading(): string {
    const cdliNumber = this.getExternalNumber('cdliNumber') || 'X000001'
    return `&${cdliNumber} = ${this.number}
#project: eblo
#atf: lang akk-x-stdbab
#atf: use unicode
#atf: use math
#atf: use legacy`
  }
}

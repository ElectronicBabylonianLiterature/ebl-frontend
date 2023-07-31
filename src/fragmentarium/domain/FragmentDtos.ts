import { ReferenceDto } from 'bibliography/domain/referenceDto'
import Folio from './Folio'
import { Introduction, Notes, ScriptDto } from './fragment'
import { RecordEntry } from './RecordEntry'
import MuseumNumber from './MuseumNumber'
import { King } from 'common/BrinkmanKings'

interface MeasureDto {
  value?: number
  note?: string
}

export interface GenreDto {
  category: readonly string[]
  uncertain: boolean
}

interface DateFieldDto {
  value: string
  broken?: boolean
  uncertain?: boolean
}

interface MonthFieldDto extends DateFieldDto {
  intercalary?: boolean
}

export interface MesopotamianDateDto {
  era: King | string // ToDo: ADD SCHEMA
  year: DateFieldDto
  month: MonthFieldDto
  day: DateFieldDto
  ur3Calendar?: string
}

export interface TextDto {
  lines: readonly any[]
  numberOfLines?: number
  // eslint-disable-next-line camelcase
  parser_version?: string
}

interface UncuratedReferenceDto {
  document: string
  pages: readonly number[]
}

type RecordEntryDto = Pick<RecordEntry, 'user' | 'date' | 'type'>

type FolioDto = Pick<Folio, 'name' | 'number'>

export interface ExternalNumbers {
  cdliNumber: string
  bmIdNumber: string
  archibabNumber: string
  bdtnsNumber: string
  urOnlineNumber: string
  hilprechtJenaNumber: string
  hilprechtHeidelbergNumber: string
}

export default interface FragmentDto {
  museumNumber: MuseumNumber
  accession: string
  editedInOraccProject: string
  publication: string
  description: string
  collection: string
  legacyScript: string
  museum: string
  width: MeasureDto
  length: MeasureDto
  thickness: MeasureDto
  joins: any
  record: readonly RecordEntryDto[]
  folios: readonly FolioDto[]
  text: TextDto
  signs: string
  notes: Notes
  references: readonly ReferenceDto[]
  uncuratedReferences: readonly UncuratedReferenceDto[] | null
  atf: string
  hasPhoto: boolean
  genres: readonly GenreDto[]
  introduction: Introduction
  script: ScriptDto
  externalNumbers: ExternalNumbers
  projects: readonly string[]
  date?: MesopotamianDateDto
  datesInText?: readonly MesopotamianDateDto[]
}

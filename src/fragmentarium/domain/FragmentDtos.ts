import { ReferenceDto } from 'bibliography/domain/referenceDto'
import Folio from './Folio'
import { Introduction, Notes, ScriptDto } from './fragment'
import { RecordEntry } from './RecordEntry'
import MuseumNumber from './MuseumNumber'
import { King } from 'common/BrinkmanKings'
import { Ur3Calendar } from './Date'
import { Eponym } from 'common/Eponyms'
import { ArchaeologyDto } from './archaeology'

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
  isBroken?: boolean
  isUncertain?: boolean
}

interface MonthFieldDto extends DateFieldDto {
  isIntercalary?: boolean
}

export interface MesopotamianDateDto {
  year: DateFieldDto
  month: MonthFieldDto
  day: DateFieldDto
  king?: King
  eponym?: Eponym
  isSeleucidEra?: boolean
  isAssyrianDate?: boolean
  ur3Calendar?: Ur3Calendar
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

export const ExternalNumberTypes = [
  'cdliNumber',
  'bmIdNumber',
  'archibabNumber',
  'bdtnsNumber',
  'urOnlineNumber',
  'hilprechtJenaNumber',
  'hilprechtHeidelbergNumber',
  'metropolitanNumber',
  'yalePeabodyNumber',
] as const
export type ExternalNumber = typeof ExternalNumberTypes[number]

export type ExternalNumbers = {
  [K in ExternalNumber]?: string
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
  archaeology?: Omit<ArchaeologyDto, 'excavationNumber'> & {
    excavationNumber?: MuseumNumber
  }
}

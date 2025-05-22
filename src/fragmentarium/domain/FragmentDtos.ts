import { ReferenceDto } from 'bibliography/domain/referenceDto'
import Folio from './Folio'
import { Introduction, Notes, ScriptDto } from './fragment'
import { RecordEntry } from './RecordEntry'
import MuseumNumber from './MuseumNumber'
import { EponymDateField, Ur3Calendar } from 'chronology/domain/DateParameters'
import { ArchaeologyDto } from './archaeologyDtos'
import { MuseumKey } from './museum'
import { ColophonDto } from 'fragmentarium/domain/Colophon'
import { DossierReference } from 'dossiers/domain/DossierReference'

export interface AcquisitionDto {
  supplier: string
  date?: number
  description?: string
}

interface MeasureDto {
  value?: number
  note?: string
}

export interface GenreDto {
  category: readonly string[]
  uncertain: boolean
}

export interface DateFieldDto {
  value: string
  isBroken?: boolean
  isUncertain?: boolean
}

export interface MonthFieldDto extends DateFieldDto {
  isIntercalary?: boolean
}

export interface KingDateDtoField {
  orderGlobal: number
  isBroken?: boolean
  isUncertain?: boolean
}

export interface MesopotamianDateDto {
  year: DateFieldDto
  month: MonthFieldDto
  day: DateFieldDto
  king?: KingDateDtoField
  eponym?: EponymDateField
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
  searchTerm?: string
  pages: readonly number[]
}

type CdliImage = string

type TraditionalReference = string

type RecordEntryDto = Pick<RecordEntry, 'user' | 'date' | 'type'>

type FolioDto = Pick<Folio, 'name' | 'number'>

export const ExternalNumberTypes = [
  'cdliNumber',
  'bmIdNumber',
  'archibabNumber',
  'bdtnsNumber',
  'chicagoIsacNumber',
  'urOnlineNumber',
  'hilprechtJenaNumber',
  'hilprechtHeidelbergNumber',
  'achemenetNumber',
  'nabuccoNumber',
  'digitaleKeilschriftBibliothekNumber',
  'metropolitanNumber',
  'pierpontMorganNumber',
  'louvreNumber',
  'dublinTcdNumber',
  'cambridgeMaaNumber',
  'ashmoleanNumber',
  'alalahHpmNumber',
  'australianinstituteofarchaeologyNumber',
  'philadelphiaNumber',
  'yalePeabodyNumber',
] as const
export type ExternalNumber = typeof ExternalNumberTypes[number]

export type ExternalNumbers = {
  [K in ExternalNumber]?: string
} & {
  oraccNumbers?: readonly string[]
  sealNumbers?: readonly string[]
}

export default interface FragmentDto {
  museumNumber: MuseumNumber
  accession: MuseumNumber | null
  publication: string
  acquisition: AcquisitionDto | null
  description: string
  joins: any
  collection: string
  legacyScript: string
  cdliImages: readonly CdliImage[]
  museum: MuseumKey
  width: MeasureDto
  length: MeasureDto
  thickness: MeasureDto
  record: readonly RecordEntryDto[]
  folios: readonly FolioDto[]
  text: TextDto
  signs: string
  notes: Notes
  references: readonly ReferenceDto[]
  uncuratedReferences: readonly UncuratedReferenceDto[] | null
  traditionalReferences: readonly TraditionalReference[]
  atf: string
  hasPhoto: boolean
  genres: readonly GenreDto[]
  introduction: Introduction
  script: ScriptDto
  externalNumbers: ExternalNumbers
  projects: readonly string[]
  dossiers: readonly DossierReference[]
  date?: MesopotamianDateDto
  datesInText?: readonly MesopotamianDateDto[]
  archaeology?: Omit<ArchaeologyDto, 'excavationNumber'> & {
    excavationNumber?: MuseumNumber
  }
  colophon?: ColophonDto
  authorziedScopes?: string[]
}

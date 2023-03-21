import { ReferenceDto } from 'bibliography/domain/referenceDto'
import Folio from './Folio'
import { Introduction, Notes, RecordEntry, ScriptDto } from './fragment'
import MuseumNumber from './MuseumNumber'

interface MeasureDto {
  value?: number
  note?: string
}

export interface GenreDto {
  category: readonly string[]
  uncertain: boolean
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
}

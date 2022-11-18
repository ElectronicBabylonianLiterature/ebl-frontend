import { ReferenceDto } from 'bibliography/domain/referenceDto'
import Folio from './Folio'
import { Introduction, RecordEntry } from './fragment'
import { Joins } from './join'
import MuseumNumber from './MuseumNumber'

interface MeasureDto {
  value: number
  note: string
}

export interface GenreDto {
  category: readonly string[]
  uncertain: boolean
}

export interface TextDto {
  lines: readonly any[]
  numberOfLines: number
  // eslint-disable-next-line camelcase
  parser_version: string
}

interface UncuratedReferenceDto {
  document: string
  pages: readonly number[]
}

export default interface FragmentDto {
  museumNumber: MuseumNumber
  accession: string
  cdliNumber: string
  bmIdNumber: string
  editedInOraccProject: string
  publication: string
  description: string
  collection: string
  legacyScript: string
  museum: string
  width: MeasureDto
  length: MeasureDto
  thickness: MeasureDto
  joins: Joins
  record: readonly RecordEntry[]
  folios: readonly Folio[]
  text: TextDto
  signs: string
  notes: string
  references: readonly ReferenceDto[]
  uncuratedReferences: readonly UncuratedReferenceDto[]
  atf: string
  hasPhoto: boolean
  genres: readonly GenreDto[]
  introduction: Introduction
}

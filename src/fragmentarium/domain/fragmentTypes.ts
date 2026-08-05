import { Text } from 'transliteration/domain/text'
import Reference from 'bibliography/domain/Reference'
import { Genres } from 'fragmentarium/domain/Genres'
import { MarkupPart } from 'transliteration/domain/markup'
import { Period, PeriodModifier } from 'common/utils/period'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { immerable } from 'immer'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'

RecordEntry[immerable] = true

export interface FragmentInfo {
  readonly number: string
  readonly accession: string
  readonly script: Script
  readonly description: string
  readonly matchingLines: Text | null
  readonly editor: string
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

export interface Measures {
  readonly length: number | null
  readonly width: number | null
  readonly thickness: number | null
  readonly lengthNote: string | null
  readonly widthNote: string | null
  readonly thicknessNote: string | null
}

export interface UncuratedReference {
  readonly searchTerm?: string
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

import { TextId } from 'transliteration/domain/text-id'

export interface ManuscriptSummary {
  readonly id: number
  readonly siglum: string
  readonly museumNumber: string
  readonly accession: string
}

export interface LineVariantOutline {
  readonly reconstruction: string
  readonly manuscriptIds: readonly number[]
}

export interface LineOutline {
  readonly index: number
  readonly number: string
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
  readonly translation: string
  readonly variants: readonly LineVariantOutline[]
}

export interface ChapterOutline {
  readonly textId: TextId
  readonly classification: string
  readonly stage: string
  readonly version: string
  readonly name: string
  readonly order: number
  readonly uncertainFragments: readonly string[]
  readonly manuscripts: readonly ManuscriptSummary[]
  readonly lines: readonly LineOutline[]
  readonly revision: string
}

export interface LinesPageDto {
  readonly total: number
  readonly offset: number
  readonly limit: number
  readonly lines: readonly Record<string, unknown>[]
  readonly revision: string
}

import { immerable } from 'immer'
import Reference from 'bibliography/domain/Reference'
import { Provenance } from 'corpus/domain/provenance'
import { Script } from 'fragmentarium/domain/fragment'

interface DossierRecordData {
  readonly id: string
  readonly description?: string
  readonly isApproximateDate?: boolean
  readonly yearRangeFrom?: number
  readonly yearRangeTo?: number
  readonly relatedKings?: number[]
  readonly provenance?: Provenance
  readonly script?: Script
  readonly references?: Reference[]
}

export default class DossierRecord {
  [immerable] = true

  readonly id: string
  readonly description?: string
  readonly isApproximateDate: boolean
  readonly yearRangeFrom?: number
  readonly yearRangeTo?: number
  readonly relatedKings: number[]
  readonly provenance?: Provenance
  readonly script?: Script
  readonly references: Reference[]

  constructor({
    id,
    description,
    isApproximateDate = false,
    yearRangeFrom,
    yearRangeTo,
    relatedKings = [],
    provenance,
    script,
    references = [],
  }: DossierRecordData) {
    this.id = id
    this.description = description
    this.isApproximateDate = isApproximateDate
    this.yearRangeFrom = yearRangeFrom
    this.yearRangeTo = yearRangeTo
    this.relatedKings = relatedKings
    this.provenance = provenance
    this.script = script
    this.references = references
  }

  toMarkdownString(): string {
    return `${this.YearsToMarkdownString()}`
  }

  private YearsToMarkdownString(): string {
    const yearRangeFrom = this.formatYear(this.yearRangeFrom)
    const yearRangeTo = this.formatYear(this.yearRangeTo)

    if (!yearRangeFrom) {
      return ''
    }

    if (this.isApproximateDate) {
      return this.formatApproximateRange(yearRangeFrom, yearRangeTo)
    }

    return this.formatExactRange(yearRangeFrom, yearRangeTo)
  }

  private formatYear(year: number | undefined): string {
    if (year === undefined) return ''
    const prefix = year < 0 ? 'BCE' : 'CE'
    return `${Math.abs(year)} ${prefix}`
  }

  private formatApproximateRange(
    yearRangeFrom: string,
    yearRangeTo: string
  ): string {
    if (yearRangeFrom === yearRangeTo || !yearRangeTo) {
      return `ca. ${yearRangeFrom}`
    }
    return `ca. ${yearRangeFrom} - ${yearRangeTo}`
  }

  private formatExactRange(yearRangeFrom: string, yearRangeTo: string): string {
    if (yearRangeFrom === yearRangeTo || !yearRangeTo) {
      return yearRangeFrom
    }
    return `${yearRangeFrom} - ${yearRangeTo}`
  }
}

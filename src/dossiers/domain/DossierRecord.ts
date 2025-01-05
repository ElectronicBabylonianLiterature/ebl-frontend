import { immerable } from 'immer'
import { Provenance } from 'corpus/domain/provenance'
import { Script, ScriptDto } from 'fragmentarium/domain/fragment'
import Citation from 'bibliography/domain/Citation'
import Reference from 'bibliography/domain/Reference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import createReference from 'bibliography/application/createReference'
import { PeriodModifiers, Periods } from 'common/period'
import { createScript } from 'fragmentarium/infrastructure/FragmentRepository'

interface DossierRecordDto {
  readonly _id: string
  readonly description?: string
  readonly isApproximateDate?: boolean
  readonly yearRangeFrom?: number
  readonly yearRangeTo?: number
  readonly relatedKings?: number[]
  readonly provenance?: Provenance
  readonly script?: ScriptDto
  readonly references?: ReferenceDto[]
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
    _id,
    description,
    isApproximateDate = false,
    yearRangeFrom,
    yearRangeTo,
    relatedKings = [],
    provenance,
    script,
    references = [],
  }: DossierRecordDto) {
    this.id = _id
    this.description = description
    this.isApproximateDate = isApproximateDate
    this.yearRangeFrom = yearRangeFrom
    this.yearRangeTo = yearRangeTo
    this.relatedKings = relatedKings
    this.provenance = provenance
    this.script = script && createScript(script)
    this.references = references.map((referenceDto) =>
      createReference(referenceDto)
    )
  }

  toMarkdownString(): string {
    const parts = [
      `**Name**: ${this.id}`,
      this.description ? `\n\n **Description**: ${this.description}` : null,
      `\n\n **Date**: ${this.yearsToMarkdownString()}`,
      this.relatedKings.length > 0
        ? `\n\n **Related Kings**: ${this.relatedKings.join(', ')}`
        : null,
      this.provenance ? `\n\n **Provenance**: ${this.provenance}` : null,
      this.script ? `\n\n **Script**: ${this.scriptToMarkdownString()}` : null,
      this.references.length > 0
        ? `\n\n **References**: ${this.references
            .map((reference) => Citation.for(reference).getMarkdown())
            .join('\n')}`
        : null,
    ]
    return parts.filter((part) => part !== null).join('')
  }

  private scriptToMarkdownString(): string {
    const script = this.script
    if (!script) {
      return ''
    }
    const periodModifier =
      script.periodModifier !== PeriodModifiers.None
        ? script.periodModifier.name
        : null
    const period = script.period !== Periods.None ? script.period.name : null
    const uncertain = script.uncertain ? '(?)' : null
    return [periodModifier, period, uncertain]
      .filter((part) => part !== null)
      .join(' ')
  }

  private yearsToMarkdownString(): string {
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

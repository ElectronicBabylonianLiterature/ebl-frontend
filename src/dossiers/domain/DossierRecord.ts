import { immerable } from 'immer'
import { Provenance, Provenances } from 'corpus/domain/provenance'
import { Script, ScriptDto } from 'fragmentarium/domain/fragment'
import Citation from 'bibliography/domain/Citation'
import Reference from 'bibliography/domain/Reference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import createReference from 'bibliography/application/createReference'
import { PeriodModifiers, Periods } from 'common/period'
import { createScript } from 'fragmentarium/infrastructure/FragmentRepository'
import _kings from 'chronology/domain/Kings.json'
import { King } from 'chronology/ui/Kings/Kings'

export interface DossierRecordDto {
  readonly _id: string
  readonly description?: string
  readonly isApproximateDate?: boolean
  readonly yearRangeFrom?: number
  readonly yearRangeTo?: number
  readonly relatedKings?: number[]
  readonly provenance?: string
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
    this.provenance = provenance ? Provenances[provenance] : null
    this.script = script && createScript(script)
    this.references = references.map((referenceDto) =>
      createReference(referenceDto),
    )
  }

  toMarkdownString(
    { bibliography }: { bibliography: boolean } = { bibliography: true },
  ): string {
    const parts = [
      { name: 'Description', value: this.description },
      { name: 'Provenance', value: this.provenance?.name },
      { name: 'Period', value: this.scriptToMarkdownString() },
      {
        name: 'Related Kings',
        value:
          this.relatedKings.length > 0 ? this.getRelatedKingsString() : null,
      },
      { name: 'Date', value: this.yearsToMarkdownString() },
    ]
    if (bibliography) {
      parts.push({
        name: 'Bibliography',
        value: this.references
          .map((reference) => Citation.for(reference).getMarkdown())
          .join('; '),
      })
    }
    return parts
      .filter((part) => !!part.value)
      .map((part) => `**${part.name}**: ${part.value}`)
      .join('\n\n')
  }

  private getRelatedKingsString(): string {
    return this.relatedKings
      .map((index) => {
        const king = (_kings as King[]).find((k) => k.orderGlobal === index)
        if (!king) {
          return 'Unknown King'
        }
        const datePart = king.date ? ` (${king.date} BCE)` : ''
        return `${king.name}${datePart}`
      })
      .join('; ')
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

  private yearsToMarkdownString(): string | null {
    if (!this.yearRangeFrom) {
      return null
    }
    const years = this.formatYears()
    return `${this.isApproximateDate ? 'ca. ' : ''}${years}`
  }

  private formatYears(): string {
    const yearFrom = this.formatYear(this.yearRangeFrom)
    if (this.yearRangeFrom === this.yearRangeTo || !this.yearRangeTo) {
      return yearFrom
    }
    const yearTo = this.formatYear(this.yearRangeTo)
    return `${yearFrom} - ${yearTo}`
  }

  private formatYear(year: number | undefined): string {
    if (year === undefined) return ''
    const prefix = year < 0 ? 'BCE' : 'CE'
    return `${Math.abs(year)} ${prefix}`
  }
}

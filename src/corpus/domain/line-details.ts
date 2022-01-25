import { immerable } from 'immer'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import { EmptyLine } from 'transliteration/domain/line'
import { TextLine } from 'transliteration/domain/text-line'
import { Provenance } from './provenance'
import { Period, PeriodModifier } from './period'
import { ManuscriptType } from './manuscript'
import { DollarLine } from 'transliteration/domain/dollar-lines'
import { NoteLine } from 'transliteration/domain/note-line'
import { isTextLine } from 'transliteration/domain/type-guards'

export class ManuscriptLineDisplay {
  readonly [immerable] = true

  constructor(
    readonly provenance: Provenance,
    readonly periodModifier: PeriodModifier,
    readonly period: Period,
    readonly type: ManuscriptType,
    readonly siglumDisambiguator: string,
    readonly labels: readonly string[],
    readonly line: TextLine | EmptyLine,
    readonly paratext: readonly (DollarLine | NoteLine)[]
  ) {}

  get number(): LineNumber | LineNumberRange | null {
    return isTextLine(this.line) ? this.line.lineNumber : null
  }

  get siglum(): string {
    return [
      this.provenance.abbreviation,
      this.period.abbreviation,
      this.type.abbreviation,
      this.siglumDisambiguator,
    ].join('')
  }
}

export class LineVariantDisplay {
  readonly [immerable] = true

  constructor(readonly manuscripts: readonly ManuscriptLineDisplay[]) {}
}

export class LineDetails {
  readonly [immerable] = true

  constructor(readonly variants: readonly LineVariantDisplay[]) {}
}

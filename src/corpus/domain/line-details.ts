import { immerable } from 'immer'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import { EmptyLine } from 'transliteration/domain/line'
import { TextLine } from 'transliteration/domain/text-line'
import { Provenance, Provenances } from './provenance'
import { Period, PeriodModifier } from './period'
import {
  compareManuscripts,
  ManuscriptType,
  ManuscriptTypes,
} from './manuscript'
import { DollarLine } from 'transliteration/domain/dollar-lines'
import {
  isDollarLine,
  isNoteLine,
  isTextLine,
} from 'transliteration/domain/type-guards'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { NoteLine } from 'transliteration/domain/note-line'

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
    readonly paratext: readonly AbstractLine[]
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

  get isStandardText(): boolean {
    return this.provenance === Provenances['Standard Text']
  }

  get isParallelText(): boolean {
    return this.type === ManuscriptTypes.Parallel
  }

  get dollarLines(): DollarLine[] {
    return this.paratext.filter(isDollarLine)
  }

  get noteLines(): NoteLine[] {
    return this.paratext.filter(isNoteLine)
  }

  get hasNotes(): boolean {
    return this.noteLines.length > 0
  }
}

export class LineVariantDisplay {
  readonly [immerable] = true

  constructor(readonly manuscripts: readonly ManuscriptLineDisplay[]) {}
}

export class LineDetails {
  readonly [immerable] = true

  constructor(readonly variants: readonly LineVariantDisplay[]) {}

  get numberOfColumns(): number {
    return Math.max(
      1,
      ...this.variants
        .flatMap((variant) => variant.manuscripts)
        .map((manuscript) => manuscript.line)
        .filter(isTextLine)
        .map((line) => line.numberOfColumns)
    )
  }

  get sortedManuscripts(): ManuscriptLineDisplay[] {
    return this.variants
      .flatMap((variant) => variant.manuscripts)
      .sort(compareManuscripts)
  }
}

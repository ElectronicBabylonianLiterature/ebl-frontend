import { immerable } from 'immer'
import { LineNumber } from 'transliteration/domain/line-number'
import { EmptyLine } from 'transliteration/domain/line'
import { TextLine } from 'transliteration/domain/text-line'
import { Provenance } from './provenance'
import { Period, PeriodModifier } from './period'
import { ManuscriptType } from './manuscript'
import { DollarLine } from 'transliteration/domain/dollar-lines'
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
    readonly number: LineNumber,
    readonly line: TextLine | EmptyLine,
    readonly paratext: readonly (DollarLine | NoteLine)[]
  ) {}
}

export class LineVariantDisplay {
  readonly [immerable] = true

  constructor(readonly manuscripts: readonly ManuscriptLineDisplay[]) {}
}

export class LineDetails {
  readonly [immerable] = true

  constructor(readonly variants: readonly LineVariantDisplay[]) {}
}

import _ from 'lodash'

import { AbstractLine } from 'transliteration/domain/abstract-line'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import { MarkupPart } from 'transliteration/domain/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { Token } from './token'

export interface Extent {
  readonly number: LineNumber | LineNumberRange
  readonly labels: readonly string[]
}

function labelsToString(labels: readonly string[]): string {
  return _.isEmpty(labels) ? '' : `${labels.join(' ')} `
}

function exentToString(extent: Extent | null): string {
  return extent
    ? `.(${labelsToString(extent.labels)}${lineNumberToString(extent.number)})`
    : ''
}

export default class TranslationLine extends AbstractLine {
  readonly type = 'TranslationLine'
  readonly parts: readonly MarkupPart[]
  readonly language: string
  readonly extent: Extent | null

  constructor(data: {
    parts: MarkupPart[]
    language: string
    extent: Extent | null
    content: Token[]
  }) {
    super(`#tr.${data.language}${exentToString(data.extent)}: `, data.content)
    this.language = data.language
    this.parts = data.parts
    this.extent = data.extent
  }
}

import _ from 'lodash'
import React from 'react'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { TextLine } from 'transliteration/domain/text-line'
import TranslationLine, {
  Extent,
} from 'transliteration/domain/translation-line'
import Markup from 'transliteration/ui/markup'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import {
  isTextLine,
  isTranslationLine,
} from 'transliteration/domain/type-guards'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import './TranslationColumn.sass'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'

function getTranslationLines(
  lines: readonly AbstractLine[],
  lineIndex: number
): TranslationLine[] {
  return _.takeWhile(
    lines.slice(lineIndex + 1),
    (line) => !isTextLine(line)
  ).filter(isTranslationLine)
}

function getRowSpan(
  lines: readonly AbstractLine[],
  lineIndex: number,
  extent: Extent
): number {
  const end = _.findIndex(
    lines,
    (line, index) =>
      index > lineIndex &&
      line.type === 'TextLine' &&
      _.isEqual((line as TextLine).lineNumber, extent.number)
  )
  return end - lineIndex
}

function createTranslationExtentLabel(
  start: LineNumber | LineNumberRange,
  end?: LineNumber | LineNumberRange
): string {
  const suffix = end ? `–(${lineNumberToString(end)})` : ''

  return `(${lineNumberToString(start)})${suffix}`
}

export default function TranslationColumn({
  language,
  lines,
  lineIndex,
}: {
  lines: readonly AbstractLine[]
  lineIndex: number
  language: string
}): JSX.Element {
  const translationLine = _.find(
    getTranslationLines(lines, lineIndex),
    (line) => line.language === language
  )

  const line = lines[lineIndex]

  return isTextLine(line) && translationLine ? (
    <>
      <TransliterationTd
        type="TranslationLine"
        className={'TranslationColumn__translation'}
        title={createTranslationExtentLabel(
          line.lineNumber,
          translationLine.extent?.number
        )}
        rowSpan={
          translationLine.extent
            ? getRowSpan(lines, lineIndex, translationLine.extent)
            : 1
        }
      >
        <Markup container={'span'} parts={translationLine.parts} />
      </TransliterationTd>
    </>
  ) : (
    <td></td>
  )
}

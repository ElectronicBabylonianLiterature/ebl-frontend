import _ from 'lodash'
import React from 'react'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import TranslationLine from 'transliteration/domain/translation-line'
import Markup from 'transliteration/ui/markup'
import TransliterationTd from 'transliteration/ui/TransliterationTd'

function getTranslationLines(
  lines: readonly AbstractLine[],
  lineIndex: number
): TranslationLine[] {
  return _.takeWhile(
    lines.slice(lineIndex + 1),
    (line) => line.type === 'TranslationLine'
  ) as TranslationLine[]
}

export default function TranslationColumn({
  language = 'en',
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

  return translationLine ? (
    <TransliterationTd type="TranslationLine">
      <Markup container={'span'} parts={translationLine.parts} />
    </TransliterationTd>
  ) : (
    <td></td>
  )
}

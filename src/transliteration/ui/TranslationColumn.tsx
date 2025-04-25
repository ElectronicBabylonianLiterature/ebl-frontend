import React from 'react'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLine } from 'transliteration/domain/text-line'
import TranslationLine from 'transliteration/domain/translation-line'
import Markup from 'transliteration/ui/markup'
import TransliterationTd from 'transliteration/ui/TransliterationTd'

export default function TranslationColumn({
  lines,
  lineIndex,
}: {
  lines: readonly AbstractLine[]
  lineIndex: number
}): JSX.Element {
  const hasTranslation =
    lines[lineIndex].type === 'TextLine' &&
    lines[lineIndex + 1]?.type === 'TranslationLine'
  if (hasTranslation) {
    const line = lines[lineIndex] as TextLine
    const translationLine = lines[lineIndex + 1] as TranslationLine
    return (
      <>
        <td>
          <sup>
            ({lineNumberToString(line.lineNumber)}
            {translationLine.extent && (
              <>-{lineNumberToString(translationLine.extent.number)}</>
            )}
            )
          </sup>
        </td>
        <TransliterationTd type="TranslationLine">
          <Markup container={'span'} parts={translationLine.parts} />
        </TransliterationTd>
      </>
    )
  }
  return hasTranslation ? (
    <TransliterationTd type="TranslationLine">
      <Markup parts={(lines[lineIndex + 1] as TranslationLine).parts} />
    </TransliterationTd>
  ) : (
    <td></td>
  )
}

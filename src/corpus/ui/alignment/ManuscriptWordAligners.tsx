import React from 'react'
import { ManuscriptAlignment } from 'corpus/domain/alignment'
import { ManuscriptLine } from 'corpus/domain/line'
import Word from 'corpus/ui/alignment/Word'
import { Token } from 'transliteration/domain/token'
import { isAnyWord } from 'transliteration/domain/type-guards'

interface Props {
  readonly manuscriptLine: ManuscriptLine
  readonly alignment: ManuscriptAlignment
  readonly reconstructionTokens: readonly Token[]
  readonly disabled: boolean
  readonly renderWord: (index: number) => JSX.Element
}

export default function ManuscriptWordAligners({
  manuscriptLine,
  alignment,
  reconstructionTokens,
  disabled,
  renderWord,
}: Props): JSX.Element {
  const renderAlignableWord = (index: number): JSX.Element =>
    disabled ? (
      <Word
        token={alignment.alignment[index]}
        reconstructionTokens={reconstructionTokens}
      />
    ) : (
      renderWord(index)
    )

  return (
    <>
      {manuscriptLine.atfTokens.map((token, index) => (
        <span key={index}>
          {isAnyWord(token) && token.alignable
            ? renderAlignableWord(index)
            : token.value}{' '}
        </span>
      ))}
    </>
  )
}

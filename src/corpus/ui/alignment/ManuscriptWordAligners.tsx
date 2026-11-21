import React from 'react'
import { AlignmentToken, ManuscriptAlignment } from 'corpus/domain/alignment'
import { ManuscriptLine } from 'corpus/domain/line'
import Word from 'corpus/ui/alignment/Word'
import WordAligner from 'corpus/ui/alignment/WordAligner'
import { Token } from 'transliteration/domain/token'
import { isAnyWord } from 'transliteration/domain/type-guards'

interface Props {
  readonly manuscriptLine: ManuscriptLine
  readonly alignment: ManuscriptAlignment
  readonly reconstructionTokens: readonly Token[]
  readonly onChange: (index: number, token: AlignmentToken) => void
  readonly disabled?: boolean
}

export default function ManuscriptWordAligners({
  manuscriptLine,
  alignment,
  reconstructionTokens,
  onChange,
  disabled = false,
}: Props): JSX.Element {
  const renderWord = (index: number): JSX.Element =>
    disabled ? (
      <Word
        token={alignment.alignment[index]}
        reconstructionTokens={reconstructionTokens}
      />
    ) : (
      <WordAligner
        token={alignment.alignment[index]}
        reconstructionTokens={reconstructionTokens}
        onChange={(token: AlignmentToken): void => onChange(index, token)}
      />
    )

  return (
    <>
      {manuscriptLine.atfTokens.map((token, index) => (
        <span key={index}>
          {isAnyWord(token) && token.alignable
            ? renderWord(index)
            : token.value}{' '}
        </span>
      ))}
    </>
  )
}

import React, { Fragment } from 'react'
import Word from 'fragmentarium/ui/lemmatization/Word'
import {
  UniqueLemma,
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'

export function WordLemmatizers({
  tokens,
  onChange,
  disabled,
  renderWord,
}: {
  tokens: readonly LemmatizationToken[]
  onChange: (index: number) => (uniqueLemma: UniqueLemma) => void
  disabled: boolean
  renderWord: (
    token: LemmatizationToken,
    index: number,
    onChange: (uniqueLemma: UniqueLemma) => void,
  ) => JSX.Element
}): JSX.Element {
  const renderLemmatizableWord = (
    token: LemmatizationToken,
    index: number,
  ): JSX.Element =>
    disabled ? (
      <Word token={token} />
    ) : (
      renderWord(token, index, onChange(index))
    )

  return (
    <>
      {tokens.map((token, index) => (
        <Fragment key={index}>
          {token.lemmatizable
            ? renderLemmatizableWord(token, index)
            : token.value}{' '}
        </Fragment>
      ))}
    </>
  )
}

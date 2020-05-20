import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { isWord } from 'transliteration/domain/type-guards'
import { Word } from 'transliteration/domain/token'
import DisplayToken from 'transliteration/ui/DisplayToken'
import { Text } from 'transliteration/domain/text'

interface GlossaryToken {
  readonly number: string
  readonly value: string
  readonly word: Word
  readonly uniqueLemma: readonly string[]
}

export function Glossary({ text }: { text: Text }): JSX.Element {
  return (
    <section>
      <h4>Glossary</h4>
      {_(text.lines)
        .flatMap((line) =>
          line.content
            .filter(isWord)
            .filter((token: Word) => token.lemmatizable)
            .map(
              (token): GlossaryToken => ({
                number: line.prefix,
                value: token.value,
                word: token,
                uniqueLemma: token.uniqueLemma ?? [],
              })
            )
        )
        .reject((token) => _.isEmpty(token.uniqueLemma))
        .groupBy((token) => token.uniqueLemma)
        .toPairs()
        .map(([lemma, tokensByLemma]): [
          readonly string[],
          readonly GlossaryToken[]
        ] => [tokensByLemma[0].uniqueLemma, tokensByLemma])
        .sortBy(([lemma, tokensByLemma]) => lemma[0])
        .map(([lemma, tokensByLemma]) => (
          <GlossaryEntry
            key={lemma.join(' ')}
            lemma={lemma}
            tokens={tokensByLemma}
          />
        ))
        .value()}
    </section>
  )
}

function GlossaryEntry({
  lemma,
  tokens,
}: {
  lemma: readonly string[]
  tokens: readonly GlossaryToken[]
}): JSX.Element {
  return (
    <div>
      <GlossaryLemma lemma={lemma} />
      {': '}
      {_(tokens)
        .groupBy((token) => token.value)
        .toPairs()
        .map(([value, tokensByValue], index) => (
          <React.Fragment key={value}>
            {index > 0 && ', '}
            <GlossaryWord tokens={tokensByValue} />
          </React.Fragment>
        ))
        .value()}
    </div>
  )
}

function GlossaryLemma({ lemma }: { lemma: readonly string[] }): JSX.Element {
  return (
    <>
      {lemma.map((l, index) => (
        <span key={index}>
          {' '}
          <Link to={`/dictionary/${l}`}>{l}</Link>
        </span>
      ))}
    </>
  )
}

function GlossaryWord({
  tokens,
}: {
  tokens: readonly GlossaryToken[]
}): JSX.Element {
  const word = _.head(tokens)?.word
  return (
    <>
      <span className="Transliteration">
        {word && <DisplayToken token={word} />}
      </span>{' '}
      ({tokens.map((token) => token.number).join(', ')})
    </>
  )
}

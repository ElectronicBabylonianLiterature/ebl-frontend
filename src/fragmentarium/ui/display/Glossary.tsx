import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { Fragment } from 'fragmentarium/domain/fragment'

interface GlossaryToken {
  readonly number: string
  readonly value: string
  readonly uniqueLemma: readonly string[]
}

export function Glossary({ fragment }: { fragment: Fragment }): JSX.Element {
  return (
    <section>
      <h4>Glossary</h4>
      {_(fragment.text.lines)
        .flatMap((line) =>
          line.content
            .filter((token) => token.lemmatizable)
            .map(
              (token): GlossaryToken => ({
                number: line.prefix,
                value: token.value,
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
            <GlossaryWord value={value} tokens={tokensByValue} />
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
  value,
  tokens,
}: {
  value: string
  tokens: readonly GlossaryToken[]
}): JSX.Element {
  return (
    <>
      {value} ({tokens.map((token) => token.number).join(', ')})
    </>
  )
}

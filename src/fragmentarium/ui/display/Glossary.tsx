import React from 'react'
import _ from 'lodash'
import { Badge } from 'react-bootstrap'
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
      <h4>
        Glossary{' '}
        <small>
          <Badge variant="warning">Beta</Badge>
        </small>
      </h4>
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
          <div key={lemma.join(' ')}>
            {lemma.map((l, index) => (
              <span key={index}>
                {' '}
                <Link to={`/dictionary/${l}`}>{l}</Link>
              </span>
            ))}
            {': '}
            {_(tokensByLemma)
              .groupBy((token) => token.value)
              .map(
                (tokensByValue, value) =>
                  value +
                  ' (' +
                  tokensByValue.map((token) => token.number).join(', ') +
                  ')'
              )
              .join(', ')}
          </div>
        ))
        .value()}
    </section>
  )
}

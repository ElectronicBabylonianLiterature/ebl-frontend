import React, { Fragment } from 'react'
import { List } from 'immutable'
import { Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import TransliterationHeader from 'fragmentarium/view/TransliterationHeader'
import SessionContext from 'auth/SessionContext'

import './Display.css'

function Display({ fragment }) {
  return (
    <Fragment>
      <TransliterationHeader fragment={fragment} />
      <ol className="Display__lines">
        {fragment.atf.split('\n').map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
      <SessionContext.Consumer>
        {session =>
          session.hasBetaAccess() && (
            <section>
              <h4>
                Glossary{' '}
                <small>
                  <Badge variant="warning">Beta</Badge>
                </small>
              </h4>
              {fragment.text.lines
                .map(line =>
                  List(
                    line.content
                      .filter(token => token.lemmatizable)
                      .map(token => ({
                        number: line.prefix,
                        value: token.value,
                        uniqueLemma: List(token.uniqueLemma)
                      }))
                  )
                )
                .flatten(1)
                .filter(token => !token.uniqueLemma.isEmpty())
                .groupBy(token => token.uniqueLemma)
                .toOrderedMap()
                .sortBy((tokensByLemma, lemma) => lemma.first())
                .map((tokensByLemma, lemma) => (
                  <div key={lemma.join(' ')}>
                    {lemma.map((l, index) => (
                      <span key={index}>
                        {' '}
                        <Link to={`/dictionary/${l}`}>{l}</Link>
                      </span>
                    ))}
                    {': '}
                    {tokensByLemma
                      .groupBy(token => token.value)
                      .map(
                        (tokensByValue, value) =>
                          value +
                          ' (' +
                          tokensByValue.map(token => token.number).join(', ') +
                          ')'
                      )
                      .join(', ')}
                  </div>
                ))
                .toList()}
            </section>
          )
        }
      </SessionContext.Consumer>
    </Fragment>
  )
}

export default Display

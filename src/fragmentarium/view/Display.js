import React, { Fragment } from 'react'
import _ from 'lodash'
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
              {_(fragment.text.lines)
                .flatMap(line =>
                  line.content
                    .filter(token => token.lemmatizable)
                    .map(token => ({
                      number: line.prefix,
                      value: token.value,
                      uniqueLemma: token.uniqueLemma
                    }))
                )
                .reject(token => _.isEmpty(token.uniqueLemma))
                .groupBy(token => token.uniqueLemma)
                .toPairs()
                .map(([lemma, tokensByLemma]) => [
                  tokensByLemma[0].uniqueLemma,
                  tokensByLemma
                ])
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
                .value()}
            </section>
          )
        }
      </SessionContext.Consumer>
    </Fragment>
  )
}

export default Display
